import React, { useState } from "react";
import * as XLSX from "xlsx";
import './App.css';

interface EmployeeData {
  name: string;
  year: number;
  month: number;
  salary: number;
}

interface VacationData {
  name: string;
  year: number;
  totalEarnings: number;
  vacationPay: number;
}

const App: React.FC = () => {
  const [vacationData, setVacationData] = useState<VacationData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const parsedData = parseData(jsonData);

        const vacationPayData = calculateVacationPay(parsedData);
        setVacationData(vacationPayData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const parseData = (data: any[]): EmployeeData[] => {
    let lastValidName = '';

    return data.slice(1).map((row: any) => {
      if (row[0]) {
        lastValidName = row[0];
      }

      return {
        name: lastValidName,
        year: row[1],
        month: row[2],
        salary: row[3],
      };
    });
  };

  const calculateVacationPay = (data: EmployeeData[]): VacationData[] => {

    const employees: { [key: string]: { [key: number]: EmployeeData[] } } = {};

    data.forEach((entry) => {
      if (!employees[entry.name]) {
        employees[entry.name] = {};
      }
      if (!employees[entry.name][entry.year]) {
        employees[entry.name][entry.year] = [];
      }
      employees[entry.name][entry.year].push(entry);
    });

    const results: VacationData[] = [];

    Object.keys(employees).forEach((name) => {
      Object.keys(employees[name]).forEach((year) => {
        const yearData = employees[name][parseInt(year)];

        if (yearData && yearData.length > 0) {
          const totalEarnings = yearData.reduce((sum, entry) => sum + entry.salary, 0);
          const averageMonthlySalary = totalEarnings / 12;
          const vacationPay = Math.floor((averageMonthlySalary / 29.3) * 28);

          results.push({
            name: name,
            year: parseInt(year),
            totalEarnings,
            vacationPay,
          });
        }
      });
    });

    return results;
  };

  return (
    <div className="App">
      <h1>Калькулятор отпускных</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {vacationData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Год</th>
              <th>Зарплата за 12 месяцев</th>
              <th>Отпускные</th>
            </tr>
          </thead>
          <tbody>
            {vacationData.map((employee, index) => (
              <tr key={index}>
                <td>{employee.name}</td>
                <td>{employee.year}</td>
                <td>{employee.totalEarnings}₽</td>
                <td>{employee.vacationPay}₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
