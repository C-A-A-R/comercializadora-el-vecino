export class DataTable {
  constructor({ columns, data = [], actions = [] }) {
    this.columns = columns; // [{ key: 'name', label: 'Nombre' }, ...]
    this.data = data;
    this.actions = actions; // [{ label: 'Editar', icon: 'edit', onClick: fn }]
  }

  render() {
    return `
      <div class="w-full overflow-x-auto bg-white rounded-xl border border-slate-border shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-surface border-b border-slate-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ${this.columns.map(col => `<th class="px-6 py-4">${col.label}</th>`).join('')}
              ${this.actions.length ? `<th class="px-6 py-4 text-right">Acciones</th>` : ''}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-border text-sm text-deep-obsidian">
            ${this.data.length === 0 ? `
              <tr>
                <td colspan="${this.columns.length + (this.actions.length ? 1 : 0)}" class="px-6 py-8 text-center text-gray-500">
                  No hay registros disponibles.
                </td>
              </tr>
            ` : this.data.map((row, idx) => `
              <tr class="hover:bg-slate-surface/50 transition">
                ${this.columns.map(col => `
                  <td class="px-6 py-4 whitespace-nowrap">
                    ${col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                  </td>
                `).join('')}
                ${this.actions.length ? `
                  <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    ${this.actions.map(act => `
                      <button data-action="${act.name}" data-index="${idx}" class="p-1 text-gray-500 hover:text-electric-blue transition" title="${act.label}">
                        <span class="material-symbols-outlined text-xl">${act.icon}</span>
                      </button>
                    `).join('')}
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}