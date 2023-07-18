#!/bin/bash
python3 make_tests.py -i テストパターン/子育て支援制度.csv -c kosodate_teate -o 子育て支援制度テスト
python3 make_tests.py -i テストパターン/生活福祉資金貸付制度.csv -c seikatsu_shikin_kashitsuke -o 生活福祉資金貸付制度テスト
