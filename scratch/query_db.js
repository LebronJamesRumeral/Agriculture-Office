const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ctjlaybuiqnakoefptie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0amxheWJ1aXFuYWtvZWZwdGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjkzNjgsImV4cCI6MjA5NjYwNTM2OH0.uZ1NaeUY6AHtF2ntueicj-asbgRALQmjWhTnwxKO-VE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('records')
    .select('id, name, first_name, last_name, middle_name, ext_name, barangay');

  if (error) {
    console.error(error);
    return;
  }

  console.log('Total records:', data.length);
  
  const numericNames = data.filter(r => r.name && /^\d+$/.test(r.name.trim()));
  console.log('Records with numeric name:', numericNames.length);
  numericNames.slice(0, 10).forEach(r => console.log(r));

  const mismatchedNames = data.filter(r => {
    if (!r.name) return false;
    const parts = [r.first_name, r.middle_name, r.last_name, r.ext_name]
      .filter(p => p && p.trim() !== '' && p.trim() !== 'N/A' && p.trim() !== 'na')
      .map(p => p.trim().toLowerCase());
    
    const nameLower = r.name.toLowerCase();
    // Check if any part is missing from the name
    return parts.some(part => !nameLower.includes(part));
  });

  console.log('Records with mismatched parts in name:', mismatchedNames.length);
  mismatchedNames.slice(0, 10).forEach(r => console.log(r));
}

main().catch(console.error);
