"""
CBIT Resource Hub - Web Database Table Viewer
A lightweight, zero-install web UI to view all tables and rows in your Render cloud PostgreSQL database.
"""

import http.server
import json
import os
import socketserver
import urllib.parse
import webbrowser
import psycopg
from psycopg.rows import dict_row

DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://cbit_admin:tYCfXKmTyElLxk4DcVSU6RmnxKNbA29i"
    "@dpg-dbrue28n74is738b8l10-a.singapore-postgres.render.com/cbit_resource_hub"
    "?sslmode=require"
)

PORT = 5050

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CBIT Resource Hub - Cloud Database Table Viewer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-100 text-slate-800 font-sans min-h-screen flex flex-col">
  <header class="bg-slate-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 rounded-lg bg-teal-500 text-slate-900 font-bold flex items-center justify-center text-xl">C</div>
      <div>
        <h1 class="text-base font-bold">Render Cloud Database — Table Viewer</h1>
        <p class="text-xs text-slate-400">cbit-resource-hub-db &bull; Singapore &bull; PostgreSQL 16</p>
      </div>
    </div>
    <div class="text-xs text-emerald-400 flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Connected to Cloud Database</span>
    </div>
  </header>

  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar: Table List -->
    <aside class="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Database Tables (10)</h2>
      <nav id="table-nav" class="space-y-1">
        <!-- Injected via JS -->
      </nav>
    </aside>

    <!-- Main Table View -->
    <main class="flex-1 p-6 overflow-y-auto flex flex-col">
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col flex-1">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 id="active-table-name" class="text-lg font-bold text-slate-900">Loading table...</h2>
            <p id="active-table-count" class="text-xs text-slate-500 mt-0.5">Fetching rows...</p>
          </div>
          <button onclick="loadTable(currentTable)" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition">
            <i class="fa fa-refresh mr-1"></i> Refresh Rows
          </button>
        </div>

        <div class="mt-4 overflow-x-auto flex-1">
          <table id="data-table" class="min-w-full text-left text-xs border-collapse">
            <thead id="table-head" class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200"></thead>
            <tbody id="table-body" class="divide-y divide-slate-100 text-slate-700"></tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <script>
    const tables = [
      { name: "resource_persons", icon: "fa-user-tie" },
      { name: "organisations", icon: "fa-building" },
      { name: "expertise", icon: "fa-lightbulb" },
      { name: "departments", icon: "fa-graduation-cap" },
      { name: "users", icon: "fa-users-gear" },
      { name: "person_organisations", icon: "fa-network-wired" },
      { name: "person_expertise", icon: "fa-tags" },
      { name: "approval_history", icon: "fa-clipboard-check" },
      { name: "audit_logs", icon: "fa-clock-rotate-left" },
      { name: "user_sessions", icon: "fa-key" }
    ];

    let currentTable = "resource_persons";

    function renderNav() {
      const nav = document.getElementById("table-nav");
      nav.innerHTML = tables.map(t => `
        <button onclick="loadTable('${t.name}')" id="btn-${t.name}" class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition text-slate-600 hover:bg-slate-50">
          <i class="fa ${t.icon} w-4 text-slate-400"></i>
          <span>${t.name}</span>
        </button>
      `).join("");
    }

    async function loadTable(tableName) {
      currentTable = tableName;
      document.querySelectorAll("#table-nav button").forEach(b => {
        b.className = "w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition text-slate-600 hover:bg-slate-50";
      });
      const activeBtn = document.getElementById(`btn-${tableName}`);
      if (activeBtn) activeBtn.className = "w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition bg-slate-900 text-white shadow-xs";

      document.getElementById("active-table-name").innerText = tableName;
      document.getElementById("active-table-count").innerText = "Loading data...";

      try {
        const res = await fetch(`/api/table?name=${tableName}`);
        const data = await res.json();

        document.getElementById("active-table-count").innerText = `${data.rows.length} rows loaded`;

        const head = document.getElementById("table-head");
        const body = document.getElementById("table-body");

        if (data.rows.length === 0) {
          head.innerHTML = "<tr><th class='p-3 text-slate-400'>Columns</th></tr>";
          body.innerHTML = "<tr><td class='p-8 text-center text-slate-400 italic'>No records found in this table.</td></tr>";
          return;
        }

        const cols = Object.keys(data.rows[0]);
        head.innerHTML = `<tr>${cols.map(c => `<th class="py-3 px-3.5 border-b">${c}</th>`).join("")}</tr>`;

        body.innerHTML = data.rows.map(r => `
          <tr class="hover:bg-slate-50/80">
            ${cols.map(c => {
              let val = r[c];
              if (val === null || val === undefined) return `<td class="py-2.5 px-3.5 text-slate-300 italic">null</td>`;
              if (typeof val === 'boolean') return `<td class="py-2.5 px-3.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">${val}</span></td>`;
              if (typeof val === 'object') val = JSON.stringify(val);
              return `<td class="py-2.5 px-3.5 max-w-xs truncate" title="${String(val)}">${String(val)}</td>`;
            }).join("")}
          </tr>
        `).join("");
      } catch (err) {
        document.getElementById("active-table-count").innerText = "Error loading data: " + err.message;
      }
    }

    renderNav();
    loadTable(currentTable);
  </script>
</body>
</html>
"""

class TableViewerHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode("utf-8"))
        elif parsed.path == "/api/table":
            query = urllib.parse.parse_qs(parsed.query)
            table_name = query.get("name", ["resource_persons"])[0]

            # Allowed tables whitelist to prevent SQL injection
            allowed = [
                "resource_persons", "organisations", "expertise", "departments",
                "users", "person_organisations", "person_expertise",
                "approval_history", "audit_logs", "user_sessions"
            ]
            if table_name not in allowed:
                table_name = "resource_persons"

            try:
                with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
                    with conn.cursor() as cur:
                        cur.execute(f"SELECT * FROM {table_name} LIMIT 100;")
                        rows = cur.fetchall()
                        # Convert date/UUID objects to strings for JSON
                        formatted_rows = []
                        for r in rows:
                            row_dict = {}
                            for k, v in r.items():
                                row_dict[k] = str(v) if v is not None else None
                            formatted_rows.append(row_dict)

                        self.send_response(200)
                        self.send_header("Content-type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"table": table_name, "rows": formatted_rows}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def main():
    print("=" * 70)
    print("CBIT RESOURCE HUB - CLOUD DATABASE TABLE VIEWER")
    print("=" * 70)
    print(f"[*] Starting local Table Viewer on http://localhost:{PORT}")
    print("[*] Connecting to Render Singapore PostgreSQL...")
    print("[-] Press Ctrl+C in this terminal to stop.")
    print("=" * 70)

    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    with socketserver.TCPServer(("", PORT), TableViewerHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    main()

