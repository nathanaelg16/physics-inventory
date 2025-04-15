package main

import (
	"testing"
)

func TestValidateCurrency(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		expectedStr   string
		expectedValid bool
	}{
		// Valid cases
		{"Simple dollar amount", "123.45", "$123.45", true},
		{"Dollar amount with $ sign", "$123.45", "$123.45", true},
		{"Zero dollars with cents", "0.50", "$0.50", true},
		{"Zero dollars with cents and $ sign", "$0.50", "$0.50", true},
		{"Whole dollar amount", "100", "$100.00", true},
		{"Whole dollar amount with $ sign", "$100", "$100.00", true},
		{"Single digit with cents", "9.99", "$9.99", true},
		{"Single digit with cents and $ sign", "$9.99", "$9.99", true},

		// Cases with leading zeros to strip
		{"Leading zeros in whole part", "09.99", "$9.99", true},
		{"Leading zeros in whole part with $ sign", "$09.99", "$9.99", true},
		{"Multiple leading zeros", "00123", "$123.00", true},
		{"Multiple leading zeros with $ sign", "$00123", "$123.00", true},
		{"Multiple leading zeros with decimal", "000.99", "$0.99", true},
		{"Multiple leading zeros with decimal and $ sign", "$000.99", "$0.99", true},

		// Invalid cases
		{"Just a dollar sign", "$", "$", false},
		{"Just a decimal point", ".", ".", false},
		{"Dollar sign with decimal point", "$.", "$.", false},
		{"Empty string", "", "", false},
		{"Decimal without leading zero", ".50", ".50", false},
		{"Decimal without leading zero with $ sign", "$.50", "$.50", false},
		{"Too many decimal places", "123.456", "123.456", false},
		{"Too few decimal places", "123.4", "123.4", false},
		{"Non-numeric characters", "abc", "abc", false},
		{"Mixed valid and invalid characters", "123abc", "123abc", false},
		{"Multiple decimal points", "123.45.67", "123.45.67", false},
		{"Multiple decimal points 2", "123.45.678", "123.45.678", false},
		{"Multiple decimal points 3", "123.456.78", "123.456.78", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, valid := validateCurrency(tt.input)
			if valid != tt.expectedValid {
				t.Errorf("validateCurrency(%q) validity = %v, want %v",
					tt.input, valid, tt.expectedValid)
			}

			if valid && result != tt.expectedStr {
				t.Errorf("validateCurrency(%q) result = %q, want %q",
					tt.input, result, tt.expectedStr)
			}
		})
	}
}
