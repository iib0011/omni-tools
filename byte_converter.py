#!/usr/bin/env python3
"""
byte_converter.py

Simple CLI Byte Converter supporting SI (1000) and Binary (1024 / KiB) conversions.

Usage examples:
  python3 byte_converter.py -v 1536 -f B -t KB       # SI: 1536 B -> 1.536 KB
  python3 byte_converter.py -v 1536 -f B -t KiB -b   # Binary: 1536 B -> 1.5 KiB
  python3 byte_converter.py --value 1.5 --from GB --to MB
  python3 byte_converter.py                       # interactive prompt
"""

from decimal import Decimal, getcontext, ROUND_HALF_UP
import argparse
import sys
import re

# increase precision
getcontext().prec = 28
getcontext().rounding = ROUND_HALF_UP

SI_FACTORS = {
    'B': Decimal(1),
    'KB': Decimal(10) ** 3,
    'MB': Decimal(10) ** 6,
    'GB': Decimal(10) ** 9,
    'TB': Decimal(10) ** 12,
    'PB': Decimal(10) ** 15,
}

BINARY_FACTORS = {
    'B': Decimal(1),
    'KIB': Decimal(2) ** 10,
    'MIB': Decimal(2) ** 20,
    'GIB': Decimal(2) ** 30,
    'TIB': Decimal(2) ** 40,
    'PIB': Decimal(2) ** 50,
}

# mapping for user-friendly unit names -> canonical
UNIT_ALIASES = {
    # Bytes
    'B': 'B', 'BYTE': 'B', 'BYTES': 'B',
    # SI
    'KB': 'KB', 'K': 'KB', 'KILOBYTE': 'KB', 'KILOBYTES': 'KB',
    'MB': 'MB', 'M': 'MB', 'MEGABYTE': 'MB', 'MEGABYTES': 'MB',
    'GB': 'GB', 'G': 'GB', 'GIGABYTE': 'GB', 'GIGABYTES': 'GB',
    'TB': 'TB', 'T': 'TB', 'TERABYTE': 'TB', 'TERABYTES': 'TB',
    'PB': 'PB', 'P': 'PB', 'PETABYTE': 'PB', 'PETABYTES': 'PB',
    # Binary (IEC)
    'KIB': 'KIB', 'KIBIBYTE': 'KIB', 'KIBIBYTES': 'KIB',
    'MIB': 'MIB', 'MIBIBYTE': 'MIB', 'MIBIBYTES': 'MIB',
    'GIB': 'GIB', 'GIBIBYTE': 'GIB', 'GIBIBYTES': 'GIB',
    'TIB': 'TIB', 'TIBIBYTE': 'TIB', 'TIBIBYTES': 'TIB',
    'PIB': 'PIB', 'PEBIBYTE': 'PIB', 'PEBIBYTES': 'PIB',
    # common mix-ins like KiB, MiB with case
    'KIB': 'KIB', 'KIB': 'KIB', 'KIB': 'KIB'
}

# Add lowercase versions for robustness
for k in list(UNIT_ALIASES.keys()):
    UNIT_ALIASES[k.lower()] = UNIT_ALIASES[k]

def normalize_unit(u: str, binary_flag: bool):
    if not u:
        raise ValueError("Unit can't be empty")
    u = re.sub(r'[^A-Za-z0-9]', '', u).upper()
    # common input "KiB", "MiB" already handled by removing non-alnum and uppercasing
    # Map aliases
    if u in UNIT_ALIASES:
        mapped = UNIT_ALIASES[u]
    else:
        # fallback: accept explicit binary forms like "KIB", or SI like "KB"
        mapped = u
    # If user requested binary but gave SI, try to convert alias
    if binary_flag:
        # prefer binary canonical names (KIB, MIB,...), but user may have given KB; handle KB->KIB
        if mapped in SI_FACTORS:
            # map KB->KIB, MB->MIB etc
            return mapped[0] + "IB" if mapped != 'B' else 'B'
    else:
        # prefer SI canonical (KB, MB,...). If mapped is like 'KIB' -> map to 'KB'
        if mapped.endswith('IB') and mapped != 'B':
            return mapped[0] + 'B'
    return mapped

def get_factor(unit: str, binary_flag: bool) -> Decimal:
    unit_norm = normalize_unit(unit, binary_flag)
    if binary_flag:
        if unit_norm not in BINARY_FACTORS:
            raise ValueError(f"Unknown binary unit: {unit} (normalized {unit_norm})")
        return BINARY_FACTORS[unit_norm]
    else:
        if unit_norm not in SI_FACTORS:
            raise ValueError(f"Unknown SI unit: {unit} (normalized {unit_norm})")
        return SI_FACTORS[unit_norm]

def convert(value: Decimal, from_unit: str, to_unit: str, binary_flag: bool) -> Decimal:
    from_factor = get_factor(from_unit, binary_flag)
    to_factor = get_factor(to_unit, binary_flag)
    # Convert to bytes first, then to target unit
    bytes_amount = value * from_factor
    result = bytes_amount / to_factor
    return result

def pretty_unit_label(unit: str, binary_flag: bool) -> str:
    u = normalize_unit(unit, binary_flag)
    # return a human label: KiB vs KB depending on binary_flag
    if binary_flag and u != 'B':
        return u  # e.g. KIB
    if not binary_flag and u != 'B':
        return u  # e.g. KB
    return 'B'

def parse_args():
    p = argparse.ArgumentParser(description="Byte Converter (SI and Binary)")
    p.add_argument('-v', '--value', help='Numeric value to convert', type=str)
    p.add_argument('-f', '--from', dest='from_unit', help='Source unit, e.g. B, KB, MB, GiB, KiB', type=str)
    p.add_argument('-t', '--to', dest='to_unit', help='Target unit, e.g. B, KB, MB, GiB, KiB', type=str)
    p.add_argument('-b', '--binary', help='Use binary factors (KiB=1024) instead of SI (KB=1000)', action='store_true')
    p.add_argument('-p', '--precision', help='Number of decimal places in output (default 6)', type=int, default=6)
    return p.parse_args()

def interactive_prompt():
    try:
        val = input("Value: ").strip()
        fu = input("From unit (e.g. B, KB, KiB, MB): ").strip()
        tu = input("To unit (e.g. B, KB, KiB, MB): ").strip()
        bin_flag = input("Binary? (y/N): ").strip().lower() in ('y', 'yes')
    except (KeyboardInterrupt, EOFError):
        print()
        sys.exit(1)
    return val, fu, tu, bin_flag

def safe_decimal(s: str) -> Decimal:
    try:
        return Decimal(s)
    except Exception:
        # try to clean thousand separators like 1,234.56
        cleaned = s.replace(',', '')
        return Decimal(cleaned)

def main():
    args = parse_args()
    if not (args.value and args.from_unit and args.to_unit):
        # interactive fallback
        val, fu, tu, bin_flag = interactive_prompt()
    else:
        val, fu, tu, bin_flag = args.value, args.from_unit, args.to_unit, args.binary

    try:
        val_dec = safe_decimal(val)
    except Exception as e:
        print(f"Invalid numeric value: {val} ({e})", file=sys.stderr)
        sys.exit(2)

    try:
        result = convert(val_dec, fu, tu, bin_flag)
    except Exception as e:
        print(f"Conversion error: {e}", file=sys.stderr)
        sys.exit(3)

    # format output with requested precision
    prec = max(0, int(getattr(args, 'precision', 6)))
    fmt = f"{{0:.{prec}f}}"
    out = fmt.format(result.normalize())
    from_label = pretty_unit_label(fu, bin_flag)
    to_label = pretty_unit_label(tu, bin_flag)

    # Show both raw and nicely formatted
    print(f"{val} {fu} -> {out} {to_label}  (binary={bin_flag})")

if __name__ == "__main__":
    main()
