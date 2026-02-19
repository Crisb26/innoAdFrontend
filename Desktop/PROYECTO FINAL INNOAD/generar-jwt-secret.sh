#!/bin/bash
# ============================================================================
# Script Bash: Generar JWT_SECRET seguro
# ============================================================================
# Ejecutar con: ./generar-jwt-secret.sh
# ============================================================================

echo "========================================"
echo "  Generador de JWT_SECRET para InnoAd"
echo "========================================"
echo ""

# Generar 64 bytes aleatorios y convertir a Base64
SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo "Tu JWT_SECRET seguro es:"
echo ""
echo "$SECRET"
echo ""
echo "Copia este valor y pégalo en tu archivo .env.server"
echo "Variable: JWT_SECRET=$SECRET"
echo ""

# Opcional: copiar al portapapeles (si xclip o pbcopy están disponibles)
if command -v xclip &> /dev/null; then
    echo -n "$SECRET" | xclip -selection clipboard
    echo "✓ Secreto copiado al portapapeles (xclip)"
elif command -v pbcopy &> /dev/null; then
    echo -n "$SECRET" | pbcopy
    echo "✓ Secreto copiado al portapapeles (pbcopy)"
else
    echo "⚠ No se pudo copiar al portapapeles automáticamente"
    echo "  Instala xclip (Linux) o usa pbcopy (Mac) para copiar automáticamente"
fi

echo ""
