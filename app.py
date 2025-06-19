import os
from flask import Flask, request, render_template, jsonify

# --- 1. CONFIGURACIÓN DE FLASK ---
app = Flask(__name__)

# --- 2. PARÁMETROS FIJOS DEL MODELO DE NEGOCIO (CONSTANTES) ---
TRM = 20.0 # Tasa de Cambio MXN a USD, fija según tus ejemplos
FAMOSOS_ADS_REVENUE_RATE = 0.70  # 70% de la Inversión Total del Cliente
CMI_REVENUE_RATE = 0.30      # 30% de la Inversión Total del Cliente
EKN_FEE_RATE = 0.13          # 13% sobre Famosos Ads Revenue

# CPMs por plataforma en USD ($ por 1000 vistas)
CPM_DATA = {
    "Instagram": 0.625, # $625 por 1,000,000 vistas, es decir, $0.625 por vista
    "TikTok": 0.500     # $500 por 1,000,000 vistas, es decir, $0.500 por vista
}

# --- 3. RUTAS DE LA APLICACIÓN ---

# Ruta principal: Sirve la página HTML de la calculadora
@app.route('/')
def index():
    return render_template('index.html')

# Ruta para el cálculo: Recibe datos del frontend y devuelve resultados JSON
@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.get_json() # Obtiene los datos enviados desde JavaScript

    # Recuperar inputs del frontend
    try:
        inversion_total_mxn = float(data.get('inversion_total_mxn', 0))
        cpv_header_input = float(data.get('cpv_header_input', 0.0)) # Valor de referencia
        influencers_cost_mxn_input = float(data.get('influencers_cost_mxn_input', 0))
        pauta_media_mxn_input = float(data.get('pauta_media_mxn_input', 0))
        plataforma_pauta = data.get('plataforma_pauta', 'TikTok')
    except (ValueError, TypeError) as e:
        return jsonify({'status': 'error', 'message': f'Error en el formato de los datos numéricos: {e}. Asegúrate de que todos los campos numéricos contengan valores válidos.'}), 400


    # --- VALIDACIONES BÁSICAS ---
    if inversion_total_mxn <= 0:
        return jsonify({'status': 'error', 'message': 'Por favor, ingresa una Inversión Total válida y mayor que cero.'}), 400


    # --- CÁLCULOS ---

    # 1. Conversión de Inversión Total
    inversion_total_usd = inversion_total_mxn / TRM

    # 2. División de Ingresos (Revenue Split)
    famosos_ads_revenue_mxn = inversion_total_mxn * FAMOSOS_ADS_REVENUE_RATE
    famosos_ads_revenue_usd = famosos_ads_revenue_mxn / TRM
    cmi_revenue_mxn = inversion_total_mxn * CMI_REVENUE_RATE
    cmi_revenue_usd = cmi_revenue_mxn / TRM

    # 3. Cálculos Basados en Famosos Ads Revenue
    ekn_fee_mxn = famosos_ads_revenue_mxn * EKN_FEE_RATE
    ekn_fee_usd = ekn_fee_mxn / TRM
    total_ekn_neto_mxn = famosos_ads_revenue_mxn - ekn_fee_mxn
    total_ekn_neto_usd = total_ekn_neto_mxn / TRM

    # --- Validaciones de Base Neta para evitar ZeroDivisionError ---
    if total_ekn_neto_mxn <= 0:
        return jsonify({'status': 'error', 'message': 'La "Base Neta para Costos" (Famosos Ads Revenue menos EKN Fee) es cero o negativa. Ajusta la Inversión Total o los Fees para que sea un valor positivo.'}), 400
    
    # Validar que los costos directos no superen la base neta
    if (influencers_cost_mxn_input + pauta_media_mxn_input) > total_ekn_neto_mxn:
        return jsonify({'status': 'error', 'message': 'La suma del Costo de Influencers y la Pauta en Media no puede exceder la Base Neta para Costos.'}), 400


    # 4. Uso de Inputs de Costos en Moneda
    influencers_cost_mxn = influencers_cost_mxn_input
    influencers_cost_usd = influencers_cost_mxn / TRM

    pauta_media_mxn = pauta_media_mxn_input
    pauta_media_usd = pauta_media_mxn / TRM

    # Cálculos de Porcentajes de Costos (ahora son outputs)
    influencers_cost_rate_calc = (influencers_cost_mxn / total_ekn_neto_mxn) * 100
    pauta_media_rate_calc = (pauta_media_mxn / total_ekn_neto_mxn) * 100
    

    # 5. Costo Total de Campaña (para la Agencia)
    costo_total_campana_mxn = influencers_cost_mxn + pauta_media_mxn
    costo_total_campana_usd = costo_total_campana_mxn / TRM

    # 6. Ganancia Neta (para la Agencia)
    ganancia_neta_mxn = total_ekn_neto_mxn - costo_total_campana_mxn
    ganancia_neta_usd = ganancia_neta_mxn / TRM
    ganancia_neta_rate_calc = (ganancia_neta_mxn / total_ekn_neto_mxn) * 100

    # 7. Cálculo de Vistas por Pauta
    cpm_seleccionado_usd = CPM_DATA.get(plataforma_pauta, 0) # Usar .get para evitar KeyError si la plataforma no existe
    views_estimadas_pauta = 0
    if cpm_seleccionado_usd > 0: # Asegurarse de que el CPM sea válido para la división
        views_estimadas_pauta = (pauta_media_usd / cpm_seleccionado_usd) * 1000
    
    # 8. Cálculo del CPV Global Calculado (basado en Inversión Total y Vistas de Pauta)
    cpv_campana_usd_calc = 0
    if views_estimadas_pauta > 0: # Asegurarse de que views_estimadas_pauta sea válido para la división
        cpv_campana_usd_calc = inversion_total_usd / views_estimadas_pauta
    

    # Preparar los resultados para enviar al frontend
    results = {
        "status": "success",
        "message": "Cálculo completado con éxito.",
        "data": {
            "inversion_total_mxn": inversion_total_mxn,
            "inversion_total_usd": inversion_total_usd,
            "famosos_ads_revenue_mxn": famosos_ads_revenue_mxn,
            "famosos_ads_revenue_usd": famosos_ads_revenue_usd,
            "cmi_revenue_mxn": cmi_revenue_mxn,
            "cmi_revenue_usd": cmi_revenue_usd,
            "ekn_fee_mxn": ekn_fee_mxn,
            "ekn_fee_usd": ekn_fee_usd,
            "total_ekn_neto_mxn": total_ekn_neto_mxn,
            "total_ekn_neto_usd": total_ekn_neto_usd,
            "influencers_cost_mxn": influencers_cost_mxn,
            "influencers_cost_usd": influencers_cost_usd,
            "influencers_cost_rate_calc": influencers_cost_rate_calc,
            "pauta_media_mxn": pauta_media_mxn,
            "pauta_media_usd": pauta_media_usd,
            "pauta_media_rate_calc": pauta_media_rate_calc,
            "costo_total_campana_mxn": costo_total_campana_mxn,
            "costo_total_campana_usd": costo_total_campana_usd,
            "ganancia_neta_mxn": ganancia_neta_mxn,
            "ganancia_neta_usd": ganancia_neta_usd,
            "ganancia_neta_rate_calc": ganancia_neta_rate_calc,
            "views_estimadas_pauta": views_estimadas_pauta,
            "cpv_campana_usd_calc": cpv_campana_usd_calc,
            "cpv_header_input": cpv_header_input,
            "plataforma_pauta": plataforma_pauta
        }
    }
    return jsonify(results)

# --- 4. EJECUCIÓN DE LA APLICACIÓN ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)