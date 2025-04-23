// Constantes para el modelo COCOMO 81 Intermedio
const COCOMO_PARAMETERS = {
    organic: { a: 3.2, b: 1.05, c: 2.5, d: 0.38 },
    semidetached: { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
    embedded: { a: 2.8, b: 1.20, c: 2.5, d: 0.32 }
  };
  
  // Cuando el DOM está completamente cargado
  document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const calculateBtn = document.getElementById('calculate');
    const resultsSection = document.getElementById('results');
    const calcProgrammers = document.getElementById('calcProgrammers');
    const calcDuration = document.getElementById('calcDuration');
    const programmersSection = document.getElementById('programmersSection');
    const durationSection = document.getElementById('durationSection');
    
    // Event listeners para opciones de cálculo
    calcProgrammers.addEventListener('change', function() {
        if (this.checked) {
            programmersSection.classList.remove('hidden');
            durationSection.classList.add('hidden');
        }
    });
    
    calcDuration.addEventListener('change', function() {
        if (this.checked) {
            durationSection.classList.remove('hidden');
            programmersSection.classList.add('hidden');
        }
    });
    
    // Event listener para el botón de cálculo
    calculateBtn.addEventListener('click', calculateCOCOMO);
    
    // Función principal de cálculo
    function calculateCOCOMO() {
        // Validar entradas
        if (!validateInputs()) {
            return;
        }
        
        // Obtener valores básicos
        const projectType = document.getElementById('projectType').value;
        const kloc = parseFloat(document.getElementById('kloc').value);
        const salary = parseFloat(document.getElementById('salary').value);
        
        // Obtener parámetros según el tipo de proyecto
        const params = COCOMO_PARAMETERS[projectType];
        
        // Calcular EAF (Factor de Ajuste de Esfuerzo)
        const eaf = calculateEAF();
        
        // Calcular esfuerzo nominal (personas-mes)
        const nominalEffort = params.a * Math.pow(kloc, params.b);
        
        // Calcular esfuerzo ajustado (personas-mes)
        const adjustedEffort = nominalEffort * eaf;
        
        // Calcular tiempo de desarrollo nominal (meses)
        const nominalTime = params.c * Math.pow(adjustedEffort, params.d);
        
        let people, time, cost;
        
        // Decidir entre calcular con programadores fijos o duración fija
        if (calcProgrammers.checked) {
            const programmers = parseInt(document.getElementById('programmers').value);
            time = adjustedEffort / programmers;
            people = programmers;
        } else {
            const duration = parseFloat(document.getElementById('duration').value);
            time = duration;
            people = adjustedEffort / duration;
        }
        
        // Calcular el costo total considerando incremento anual
        cost = calculateTotalCost(time, salary);
        
        // Mostrar resultados
        displayResults(adjustedEffort.toFixed(2), time.toFixed(2), people.toFixed(1), cost, nominalTime.toFixed(2));
    }
    
    // Calcular el Factor de Ajuste de Esfuerzo (EAF)
    function calculateEAF() {
        const costDriverIds = [
            'rely', 'data', 'cplx', 'time', 'stor', 'virt', 'turn',
            'acap', 'pcap', 'aexp', 'pexp', 'ltex', 'tool', 'site', 'sced'
        ];
        
        let eaf = 1.0;
        
        costDriverIds.forEach(id => {
            const value = parseFloat(document.getElementById(id).value);
            eaf *= value;
        });
        
        return eaf;
    }
    
    // Calcular el costo total considerando incremento salarial anual
    function calculateTotalCost(effort, monthlySalary) {
        const ANNUAL_INCREASE = 0.05;
        const MONTHS_PER_YEAR = 12;

        console.log(effort);
        
    
        let totalCost = 0;
        let remainingEffort = effort;
        let currentYear = 0;
    
        while (remainingEffort > 0) {
            const adjustedSalary = monthlySalary * Math.pow(1 + ANNUAL_INCREASE, currentYear);
            const monthsThisYear = Math.min(remainingEffort, MONTHS_PER_YEAR);
            totalCost += monthsThisYear * adjustedSalary;
    
            console.log(`Año ${currentYear + 1} | Meses: ${monthsThisYear} | Salario ajustado: $${adjustedSalary.toFixed(2)} | Acumulado: $${totalCost.toFixed(2)}`);
    
            remainingEffort -= monthsThisYear;
            currentYear++;
        }
    
        return totalCost.toFixed(2);
    }
    
    
    
    // Mostrar los resultados en la interfaz
    function displayResults(effort, time, people, cost, nominalTime) {
        document.getElementById('effortResult').textContent = effort;
        document.getElementById('timeResult').textContent = time;
        document.getElementById('peopleResult').textContent = people;
        document.getElementById('costResult').textContent = `$${formatNumber(cost)}`;
        
        // Generar interpretación
        const interpretation = generateInterpretation(parseFloat(effort), parseFloat(time), parseFloat(people), parseFloat(cost), parseFloat(nominalTime));
        document.getElementById('interpretation').textContent = interpretation;
        
        // Mostrar sección de resultados
        resultsSection.classList.remove('hidden');
        
        // Hacer scroll hacia los resultados
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Validar entradas del usuario
    function validateInputs() {
        const kloc = document.getElementById('kloc').value;
        const salary = document.getElementById('salary').value;
        
        if (kloc === '' || parseFloat(kloc) <= 0) {
            alert('Por favor, ingrese un tamaño de proyecto válido en KLOC.');
            return false;
        }
        
        if (salary === '' || parseFloat(salary) <= 0) {
            alert('Por favor, ingrese un salario mensual válido.');
            return false;
        }
        
        if (calcProgrammers.checked) {
            const programmers = document.getElementById('programmers').value;
            if (programmers === '' || parseInt(programmers) <= 0) {
                alert('Por favor, ingrese un número válido de programadores.');
                return false;
            }
        } else {
            const duration = document.getElementById('duration').value;
            if (duration === '' || parseFloat(duration) <= 0) {
                alert('Por favor, ingrese una duración válida en meses.');
                return false;
            }
        }
        
        return true;
    }
    
    // Generar un mensaje de interpretación de los resultados
    function generateInterpretation(effort, time, people, cost, nominalTime) {
        let interpretation = `Se estima que este proyecto requerirá un esfuerzo de ${effort} persona-meses, `;
        
        if (calcProgrammers.checked) {
            interpretation += `con un equipo de ${Math.round(people)} programadores, lo que resultaría en una duración de aproximadamente ${Math.round(time)} meses.`;
        } else {
            interpretation += `con una duración fija de ${time} meses, lo que requeriría un equipo de aproximadamente ${Math.round(people)} programadores.`;
        }
        
        if (time < nominalTime * 0.75) {
            interpretation += ` Tenga en cuenta que la duración planificada es significativamente menor que la duración óptima estimada (${Math.round(nominalTime)} meses), lo que podría aumentar los riesgos del proyecto.`;
        } else if (time > nominalTime * 1.5) {
            interpretation += ` La duración planificada es considerablemente mayor que la duración óptima estimada (${Math.round(nominalTime)} meses), lo que podría aumentar los costos del proyecto.`;
        }
        
        interpretation += ` El costo total estimado es de $${formatNumber(cost)}.`;
        
        // Añadir interpretación sobre el costo
        if (cost > 1000000) {
            interpretation += " Este es un proyecto de alto presupuesto, se recomienda una planificación cuidadosa y revisiones periódicas.";
        }
        
        return interpretation;
    }
    
    // Formato de números para mejor legibilidad
    function formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
  })