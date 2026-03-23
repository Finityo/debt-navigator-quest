import { useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDebtStore } from '@/store/useDebtStore';
import type { DebtType } from '@/types/debt';
import { toast } from 'sonner';

const TEMPLATE_HEADERS = 'creditorName,balance,apr,minPayment,dueDate,type,notes';
const EXAMPLE_ROW = 'Chase Visa,4200,21.9,95,2025-04-15,credit_card,Balance transfer promo ends June';

const VALID_TYPES: DebtType[] = ['credit_card', 'student_loan', 'auto_loan', 'mortgage', 'personal_loan', 'medical', 'other'];

function downloadTemplate() {
  const csv = `${TEMPLATE_HEADERS}\n${EXAMPLE_ROW}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'debt-navigator-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default function CsvImportExport() {
  const addDebt = useDebtStore((s) => s.addDebt);
  const computePlan = useDebtStore((s) => s.computePlan);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      let imported = 0;
      let skipped = 0;

      for (const line of dataLines) {
        const cols = parseCsvRow(line);
        const creditorName = cols[0] || '';
        const balance = parseFloat(cols[1]);
        const apr = parseFloat(cols[2]) || 0;
        const minPayment = parseFloat(cols[3]) || 0;
        const dueDate = cols[4] || '';
        const rawType = (cols[5] || 'other').toLowerCase().replace(/\s+/g, '_') as DebtType;
        const type = VALID_TYPES.includes(rawType) ? rawType : 'other';
        const notes = cols[6] || '';

        if (!creditorName.trim() || isNaN(balance) || balance <= 0) {
          skipped++;
          continue;
        }

        const dueDateNote = dueDate ? ` • Due: ${dueDate}` : '';

        addDebt({
          id: `csv-${Date.now()}-${imported}`,
          creditorName: creditorName.slice(0, 100),
          balance,
          apr: apr / 100,
          minPayment,
          type,
          startDate: new Date().toISOString().slice(0, 10),
          notes: `${notes}${dueDateNote}`.trim(),
        });
        imported++;
      }

      if (imported > 0) {
        computePlan();
        toast.success(`${imported} debt${imported !== 1 ? 's' : ''} imported from CSV – plan updated`);
      }
      if (skipped > 0) {
        toast.warning(`Skipped ${skipped} invalid row${skipped !== 1 ? 's' : ''}`);
      }
      if (imported === 0 && skipped === 0) {
        toast.error('No data found in CSV');
      }
    };

    reader.readAsText(file);
    // Reset so the same file can be re-uploaded
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card className="glass-card border border-primary/15 shadow-xl">
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm">Excel / CSV Import</h2>
            <p className="text-xs text-muted-foreground">
              Work in Excel? Download template → fill it out → upload
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button
            size="sm"
            onClick={downloadTemplate}
            className="glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            id="export-btn"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            id="import-btn"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload Filled Template
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </CardContent>
    </Card>
  );
}
