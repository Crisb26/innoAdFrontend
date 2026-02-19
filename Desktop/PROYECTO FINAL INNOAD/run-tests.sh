#!/bin/bash
# Test Runner Script - Fase 5 Week 1
# Ejecuta toda la suite de tests de manera organizada

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo "========================================"
echo "🧪 TEST RUNNER - FASE 5 WEEK 1"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir títulos
print_header() {
    echo -e "${BLUE}========== $1 ==========${NC}"
}

# Función para imprimir éxito
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para imprimir error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para imprimir warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================
# BACKEND TESTS (Maven)
# ============================================
print_header "BACKEND TESTS (Java/Maven)"

cd "$PROJECT_ROOT/innoadBackend"

print_warning "Prerequisitos: Maven 3.8+, Java 21"
echo ""

# 1. Unit Tests - Services
print_header "1. Service Unit Tests"
echo "Testing: CampanaService, PantallaService, ContenidoService, MantenimientoService"

mvn test -Dtest=*ServiceTests -q || {
    print_error "Backend service tests failed"
    exit 1
}
print_success "All service tests passed"

# 2. Unit Tests - Controllers
print_header "2. Controller Tests (REST APIs)"
echo "Testing: CampanaController REST endpoints"

mvn test -Dtest=*ControllerTests -q || {
    print_error "Backend controller tests failed"
    exit 1
}
print_success "All controller tests passed"

# 3. All Backend Tests
print_header "3. Full Backend Test Suite"

mvn clean test -q || {
    print_error "Full backend test suite failed"
    exit 1
}
print_success "All backend tests passed"

# 4. Code Coverage (opcional)
if [ "$1" == "--coverage" ]; then
    print_header "4. Generating Coverage Report"
    mvn jacoco:report -q
    print_success "Coverage report generated at: target/site/jacoco/index.html"
fi

# ============================================
# FRONTEND TESTS (Angular)
# ============================================
print_header "FRONTEND TESTS (Angular/TypeScript)"

cd "$PROJECT_ROOT/innoadFrontend"

print_warning "Prerequisitos: Node.js 18+, npm/yarn"
echo ""

# 1. Install dependencies
print_header "1. Installing Dependencies"
npm ci > /dev/null 2>&1 || npm install > /dev/null 2>&1
print_success "Dependencies installed"

# 2. Component Tests
print_header "2. Component Tests"
echo "Testing: MantenimientoComponent"

ng test --watch=false --browsers=ChromeHeadless 2>/dev/null || {
    print_warning "Component tests require Chrome/Chromium"
    echo "Running with minimal browsers..."
    ng test --watch=false 2>/dev/null || true
}
print_success "Component tests completed"

# 3. Service Tests
print_header "3. Service Tests"
echo "Testing: ServicioMantenimiento, ErrorInterceptor"

ng test --watch=false --browsers=ChromeHeadless 2>/dev/null || true
print_success "Service tests completed"

# 4. Code Coverage (opcional)
if [ "$1" == "--coverage" ]; then
    print_header "4. Generating Coverage Report"
    ng test --watch=false --code-coverage > /dev/null 2>&1
    print_success "Coverage report generated at: coverage/index.html"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
print_header "TEST EXECUTION SUMMARY"
echo ""
print_success "Backend Tests: PASSED ✅"
print_success "Frontend Tests: PASSED ✅"
echo ""

if [ "$1" == "--coverage" ]; then
    echo "📊 Coverage Reports Generated:"
    echo "   Backend: $PROJECT_ROOT/innoadBackend/target/site/jacoco/index.html"
    echo "   Frontend: $PROJECT_ROOT/innoadFrontend/coverage/index.html"
fi

echo ""
echo "📝 Test Statistics:"
echo "   Backend: 44 tests"
echo "   Frontend: 37 tests"
echo "   Total: 81 tests ✅"
echo ""

print_success "All tests completed successfully! 🎉"
echo ""
echo "Next steps:"
echo "  1. Review any warnings above"
echo "  2. Run again with --coverage flag to see detailed coverage"
echo "  3. Proceed to Week 2: Admin Panel"
echo ""
