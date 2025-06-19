// static/js/main.js - VERSIÓN FINAL Y MÁS ROBUSTA PARA VISUALIZACIÓN
console.log("main.js: Script ha comenzado a ejecutarse. (Línea 1)");

// Definir constantes como variables globales (accesibles en todo el script)
const CPM_DATA = {
    "Instagram": 0.625,
    "TikTok": 0.500
};
const EKN_FEE_RATE = 0.13;
const TRM_DISPLAY_VALUE = 20.00; // Valor de TRM para mostrar

document.addEventListener('DOMContentLoaded', function() {
    console.log("main.js: DOMContentLoaded ha sido disparado. Intentando inicializar calculadora.");

    // Referencias a los elementos del DOM. Añadimos logs para depuración extra.
    const calcularBtn = document.getElementById('calcularBtn');
    console.log("Referencia a calcularBtn:", calcularBtn);
    if (!calcularBtn) {
        console.error("ERROR CRÍTICO: Botón 'calcularBtn' no encontrado en el DOM. La aplicación no funcionará.");
        return; // Detiene la ejecución si el botón esencial no se encuentra
    }

    // Asegurarse de que todos los inputs existan
    const inversionTotalInput = document.getElementById('inversion_total_mxn');
    if (!inversionTotalInput) console.error("Error: Input 'inversion_total_mxn' no encontrado.");

    const cpvHeaderInput = document.getElementById('cpv_header_input');
    if (!cpvHeaderInput) console.error("Error: Input 'cpv_header_input' no encontrado.");

    const influencersCostMxnInput = document.getElementById('influencers_cost_mxn_input');
    if (!influencersCostMxnInput) console.error("Error: Input 'influencers_cost_mxn_input' no encontrado.");

    const pautaMediaMxnInput = document.getElementById('pauta_media_mxn_input');
    if (!pautaMediaMxnInput) console.error("Error: Input 'pauta_media_mxn_input' no encontrado.");

    const plataformaPautaSelect = document.getElementById('plataforma_pauta');
    if (!plataformaPautaSelect) console.error("Error: Select 'plataforma_pauta' no encontrado.");


    // Contenedores de resultados
    const resultadosDiv = document.getElementById('resultados');
    if (!resultadosDiv) console.error("Error: Div 'resultados' no encontrado.");

    const tableInversionGeneralBody = document.querySelector('#table-inversion-general tbody');
    if (!tableInversionGeneralBody) console.error("Error: Table 'table-inversion-general tbody' no encontrado.");

    const tableFamososAdsBody = document.querySelector('#table-famosos-ads tbody');
    if (!tableFamososAdsBody) console.error("Error: Table 'table-famosos-ads tbody' no encontrado.");

    const viewsLabel = document.getElementById('views-label');
    if (!viewsLabel) console.error("Error: Label 'views-label' no encontrado.");

    const viewsValue = document.getElementById('views-value');
    if (!viewsValue) console.error("Error: Value 'views-value' no encontrado.");

    const cpvCalculatedValue = document.getElementById('cpv-calculated-value');
    if (!cpvCalculatedValue) console.error("Error: Value 'cpv-calculated-value' no encontrado.");

    const cpvReferenceValue = document.getElementById('cpv-reference-value');
    if (!cpvReferenceValue) console.error("Error: Value 'cpv-reference-value' no encontrado.");

    const resumenFinalDiv = document.getElementById('resumen-final');
    if (!resumenFinalDiv) console.error("Error: Div 'resumen-final' no encontrado.");


    // Elementos para mostrar las constantes fijas
    const trmDisplay = document.getElementById('trm-display');
    if (!trmDisplay) console.error("Error: Display 'trm-display' no encontrado.");

    const cpmIgDisplay = document.getElementById('cpm-ig-display');
    if (!cpmIgDisplay) console.error("Error: Display 'cpm-ig-display' no encontrado.");

    const cpmTtDisplay = document.getElementById('cpm-tt-display'); 
    if (!cpmTtDisplay) console.error("Error: Display 'cpm-tt-display' no encontrado.");


    console.log("Referencias a displays de constantes:", { trmDisplay, cpmIgDisplay, cpmTtDisplay });


    // --- Funciones de Formato ---
    function formatCurrency(value) {
        if (value === null || isNaN(value)) return 'N/A';
        return `$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    function formatCurrencyUSD(value) {
        if (value === null || isNaN(value)) return 'N/A';
        return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    function formatPercentage(value) {
        if (value === null || isNaN(value)) return 'N/A';
        return `${parseFloat(value).toFixed(2)}%`;
    }
    function formatCPV(value) {
        if (value === null || isNaN(value)) return 'N/A';
        return `$${parseFloat(value).toFixed(4)}`;
    }
    function formatViews(value) {
        if (value === null || isNaN(value)) return 'N/A';
        return `${parseInt(value).toLocaleString('es-MX')}`;
    }

    // --- Lógica para mostrar las constantes fijas al cargar la página ---
    if (trmDisplay) {
        trmDisplay.textContent = TRM_DISPLAY_VALUE.toFixed(2);
    } else {
        console.error("Elemento con ID 'trm-display' no encontrado. No se puede actualizar.");
    }
    if (cpmIgDisplay) {
        cpmIgDisplay.textContent = `$${CPM_DATA.Instagram.toFixed(3)} USD`;
    } else {
        console.error("Elemento con ID 'cpm-ig-display' no encontrado. No se puede actualizar.");
    }
    if (cpmTtDisplay) {
        cpmTtDisplay.textContent = `$${CPM_DATA.TikTok.toFixed(3)} USD`;
    } else {
        console.error("Elemento con ID 'cpm-tt-display' no encontrado. No se puede actualizar.");
    }


    // --- Event Listener para el botón Calcular ---
    calcularBtn.addEventListener('click', async function() {
        console.log("Botón Calcular clickeado."); // Log de depuración
        // Limpiar resultados anteriores
        tableInversionGeneralBody.innerHTML = '';
        tableFamososAdsBody.innerHTML = '';
        viewsValue.textContent = '0';
        cpvCalculatedValue.textContent = '$0.0000';
        cpvReferenceValue.textContent = '$0.000';
        resumenFinalDiv.innerHTML = '';
        resultadosDiv.style.display = 'none'; // Ocultar mientras se calcula o si hay error


        const inputs = {
            inversion_total_mxn: parseFloat(inversionTotalInput.value),
            cpv_header_input: parseFloat(cpvHeaderInput.value),
            influencers_cost_mxn_input: parseFloat(influencersCostMxnInput.value),
            pauta_media_mxn_input: parseFloat(pautaMediaMxnInput.value),
            plataforma_pauta: plataformaPautaSelect.value
        };

        try {
            const response = await fetch('/calcular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputs)
            });

            const result = await response.json();

            if (result.status === 'success') {
                const data = result.data;
                console.log("Datos recibidos del backend:", data); // ¡Depuración clave para N/A!

                // Rellenar tabla de Inversión General
                tableInversionGeneralBody.innerHTML += `<tr><td>Inversión Total Cliente</td><td>${formatCurrency(data.inversion_total_mxn)}</td><td>${formatCurrencyUSD(data.inversion_total_usd)}</td></tr>`;
                tableInversionGeneralBody.innerHTML += `<tr><td><strong>Famosos Ads Revenue (70%)</strong></td><td>${formatCurrency(data.famosos_ads_revenue_mxn)}</td><td>${formatCurrencyUSD(data.famosos_ads_revenue_usd)}</td></tr>`;
                tableInversionGeneralBody.innerHTML += `<tr><td><strong>CMI Revenue (30%)</strong></td><td>${formatCurrency(data.cmi_revenue_mxn)}</td><td>${formatCurrencyUSD(data.cmi_revenue_usd)}</td></tr>`;

                // Rellenar tabla de Famosos Ads Revenue
                tableFamososAdsBody.innerHTML += `<tr><td>Famosos Ads Revenue</td><td>${formatCurrency(data.famosos_ads_revenue_mxn)}</td><td>${formatCurrencyUSD(data.famosos_ads_revenue_usd)}</td><td></td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr><td>➖ EKN Fee (13%)</td><td>-${formatCurrency(data.ekn_fee_mxn)}</td><td>-${formatCurrencyUSD(data.ekn_fee_usd)}</td><td>${formatPercentage(EKN_FEE_RATE * 100)}</td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr class="subtotal"><td><strong>Base Neta para Costos (Total a cobrar EKN)</strong></td><td><strong>${formatCurrency(data.total_ekn_neto_mxn)}</strong></td><td><strong>${formatCurrencyUSD(data.total_ekn_neto_usd)}</strong></td><td></td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr><td>➖ Influencers Cost</td><td>-${formatCurrency(data.influencers_cost_mxn)}</td><td>-${formatCurrencyUSD(data.influencers_cost_usd)}</td><td>${formatPercentage(data.influencers_cost_rate_calc)}</td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr><td>➖ Pauta en Media</td><td>-${formatCurrency(data.pauta_media_mxn)}</td><td>-${formatCurrencyUSD(data.pauta_media_usd)}</td><td>${formatPercentage(data.pauta_media_rate_calc)}</td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr><td><strong>Costo Total Campaña (Agencia)</strong></td><td><strong>${formatCurrency(data.costo_total_campana_mxn)}</strong></td><td><strong>${formatCurrencyUSD(data.costo_total_campana_usd)}</strong></td><td></td></tr>`;
                tableFamososAdsBody.innerHTML += `<tr><td><strong>GANANCIA NETA (Agencia)</strong></td><td><strong>${formatCurrency(data.ganancia_neta_mxn)}</strong></td><td><strong>${formatCurrencyUSD(data.ganancia_neta_usd)}</strong></td><td><strong>${formatPercentage(data.ganancia_neta_rate_calc)}</strong></td></tr>`;

                // Actualizar métricas individuales
                // Corrección para que siempre muestre la plataforma o un valor por defecto si no está definido
                viewsLabel.textContent = `Vistas Estimadas por Pauta en ${data.plataforma_pauta || 'Plataforma no especificada'}`;
                viewsValue.textContent = formatViews(data.views_estimadas_pauta);
                cpvCalculatedValue.textContent = formatCPV(data.cpv_campana_usd_calc);
                cpvReferenceValue.textContent = formatCPV(data.cpv_header_input);

                // Resumen Final
                resumenFinalDiv.innerHTML = `
                    <p style="text-align: left; margin-bottom: 0; line-height: 1.8;">
                        <strong>Resumen General de la Proyección:</strong><br>
                        - Inversión Total del Cliente: ${formatCurrency(data.inversion_total_mxn)} MXN (${formatCurrencyUSD(data.inversion_total_usd)} USD)<br>
                        - Costo de Influencers: ${formatCurrency(data.influencers_cost_mxn)} MXN<br>
                        - Pauta en Media: ${formatCurrency(data.pauta_media_mxn)} MXN<br>
                        - Ganancia Neta para Famosos.com: ${formatCurrency(data.ganancia_neta_mxn)} MXN (${formatCurrencyUSD(data.ganancia_neta_usd)} USD)<br>
                        - Vistas proyectadas por pauta en ${data.plataforma_pauta || 'Plataforma no especificada'}: ${formatViews(data.views_estimadas_pauta)} vistas<br>
                        - CPV global de campaña: ${formatCPV(data.cpv_campana_usd_calc)} USD
                    </p>
                `;

                resultadosDiv.style.display = 'block'; // Mostrar la sección de resultados
            } else {
                // Mostrar mensaje de error del backend
                const errorMessageElement = document.createElement('div');
                errorMessageElement.classList.add('message', 'error');
                errorMessageElement.textContent = `Error: ${result.message}`;
                resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores
                resultadosDiv.appendChild(errorMessageElement); // Añadir el mensaje de error
                resultadosDiv.classList.remove('hidden'); // Asegurarse de que el contenedor de resultados esté visible para mostrar el error
            }
        } catch (error) {
            console.error('Error al calcular (Frontend):', error);
            const errorMessageElement = document.createElement('div');
            errorMessageElement.classList.add('message', 'error');
            errorMessageElement.textContent = 'Ocurrió un error de conexión o procesamiento en el frontend. Por favor, revisa los valores ingresados y la consola del navegador.';
            resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores
            resultadosDiv.appendChild(errorMessageElement); // Añadir el mensaje de error
            resultadosDiv.classList.remove('hidden');
        }
    });

    // También ejecutar el cálculo al cargar la página con valores predeterminados
    calcularBtn.click();
});