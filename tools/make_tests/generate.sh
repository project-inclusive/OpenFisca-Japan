#!/bin/bash
python3 make_tests.py -i "テストパターン/子育て支援制度 2000-05-01.csv" -c kosodate_teate -p "2024-10-01" -o "子育て支援制度テスト 2000-05-01"
python3 make_tests.py -i "テストパターン/子育て支援制度 2024-11-01.csv" -c kosodate_teate -p "2024-11-01" -o "子育て支援制度テスト 2024-11-01"
python3 make_tests.py -i テストパターン/生活福祉資金貸付制度.csv -c seikatsu_shikin_kashitsuke -o 生活福祉資金貸付制度テスト
