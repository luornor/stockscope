from unittest.mock import patch

from django.core.cache import cache
from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIClient

from .providers import DEFAULT_KWAYISI_GSE_BASE, KwayisiGSEProvider, SymbolsProvider, _kwayisi_base


class KwayisiProviderTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    @override_settings(KWAYISI_GSE_BASE="KWAYISI")
    def test_invalid_kwayisi_base_uses_default_url(self):
        self.assertEqual(_kwayisi_base(), DEFAULT_KWAYISI_GSE_BASE)

    @patch("market.providers._request_json")
    def test_quotes_parse_kwayisi_live_rows(self, mock_request_json):
        mock_request_json.return_value = [
            {"name": "MTNGH", "price": 2.51, "change": 0.02, "volume": 1200},
            {"name": "GCB", "price": 6.7, "change": -0.1, "volume": 500},
        ]

        quotes = KwayisiGSEProvider().fetch_many(
            [{"symbol": "MTNGH", "name": "MTN Ghana"}, {"symbol": "GCB", "name": "GCB Bank"}],
            "ghana",
        )

        self.assertEqual(quotes[0].symbol, "MTNGH")
        self.assertEqual(quotes[0].price, 2.51)
        self.assertEqual(quotes[0].change, 0.02)
        self.assertEqual(quotes[0].volume, 1200)
        self.assertEqual(quotes[1].change, -0.1)

    @patch("market.providers._request_json")
    def test_symbols_parse_kwayisi_equities_name_field(self, mock_request_json):
        mock_request_json.return_value = [
            {"name": "MTNGH", "price": 2.51},
            {"name": "ABC", "company": {"name": "ABC Company Ltd."}, "price": 1.25},
        ]

        symbols = SymbolsProvider.list("ghana")

        self.assertEqual(symbols[0], {"symbol": "MTNGH", "name": "MTN Ghana"})
        self.assertEqual(symbols[1], {"symbol": "ABC", "name": "ABC Company Ltd."})

    @patch("market.providers._request_json")
    def test_ghana_quotes_endpoint_matches_frontend_contract(self, mock_request_json):
        mock_request_json.return_value = [
            {"name": "MTNGH", "price": 2.51, "change": 0.02, "volume": 1200},
            {"name": "GCB", "price": 6.7, "change": -0.1, "volume": 500},
        ]

        response = APIClient().get("/api/quotes?market=ghana")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.json()[0].keys()),
            {"symbol", "name", "price", "change", "volume"},
        )
