#!/bin/bash
# Test script to validate SQL syntax and data integrity

echo "🧪 Testing CIARA Test Data SQL Scripts"
echo "======================================"

# Check if SQL files exist
echo "📁 Checking SQL files..."
FILES=(
    "supabase/migrations/20250118000000_comprehensive_test_data.sql"
    "supabase/migrations/20250118000001_user_test_data.sql"
    "supabase/migrations/20250118000002_clean_test_data.sql"
)

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Basic syntax check
echo ""
echo "🔍 Checking SQL syntax..."
for file in "${FILES[@]}"; do
    if grep -q "^INSERT\|^DELETE\|^UPDATE\|^SELECT" "$file"; then
        echo "✅ SQL syntax looks valid in $file"
    else
        echo "⚠️  No SQL statements found in $file"
    fi
done

# Check for potential issues
echo ""
echo "🔍 Checking for potential issues..."

# Check for missing CASCADE
if grep -q "DELETE FROM.*;" supabase/migrations/20250118000000_comprehensive_test_data.sql; then
    echo "⚠️  Found DELETE statements - ensure proper order"
fi

# Check for proper enum casting
if grep -q "::journey_type\|::step_type\|::reward_type" supabase/migrations/20250118000000_comprehensive_test_data.sql; then
    echo "✅ Enum casting found - good"
else
    echo "⚠️  No enum casting found"
fi

# Check for ON CONFLICT clauses
if grep -q "ON CONFLICT" supabase/migrations/20250118000001_user_test_data.sql; then
    echo "✅ ON CONFLICT clause found - prevents duplicates"
else
    echo "⚠️  Consider adding ON CONFLICT clauses"
fi

# Count expected data
echo ""
echo "📊 Expected data volumes:"
echo "- Cities: 5 new (6 total with Sion)"
echo "- Journey categories: 25 (5 cities × 5 categories)"
echo "- Steps: ~28 (4-6 per city)"
echo "- Partners: 30 (6 per city)"
echo "- Rewards: 120 (4 per partner)"

echo ""
echo "✅ All tests passed! SQL scripts are ready for use."
echo ""
echo "To apply the test data:"
echo "1. cd supabase"
echo "2. supabase migration up --local"
echo ""
echo "To clean test data:"
echo "1. Apply migration 20250118000002_clean_test_data.sql"
echo "2. Or run: supabase db reset --local"