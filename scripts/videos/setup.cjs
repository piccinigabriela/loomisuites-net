// Pasos que no se graban: cargar una reserva directa para mostrar
async function createDirect(p, { guest, phone, unit, from, to, status = 'Pendiente' }) {
  await p.getByRole('button', { name: '+ Nueva Reserva' }).first().click();
  await p.waitForTimeout(800);
  const modal = p.locator('form').filter({ has: p.getByPlaceholder('Ej: Sofía Herrera') });
  const sels = modal.locator('select');
  if (unit) { const opt = await sels.nth(0).locator('option', { hasText: unit }).first().getAttribute('value'); await sels.nth(0).selectOption(opt); }
  const dates = modal.locator('input[type=date]');
  await dates.nth(0).fill(from); await dates.nth(1).fill(to);
  await modal.getByPlaceholder('Ej: Sofía Herrera').fill(guest);
  if (phone) await modal.getByPlaceholder('Ej: +54 9 11 1234-5678').fill(phone);
  await sels.nth(2).selectOption({ label: status });
  await p.waitForTimeout(400);
  await modal.getByRole('button', { name: 'Confirmar y Guardar Reserva' }).click();
  await p.waitForTimeout(1200);
}
module.exports = { createDirect };
