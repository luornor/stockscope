# market/serializers.py
from rest_framework import serializers

class QuoteSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    name = serializers.CharField()
    price = serializers.FloatField()
    change = serializers.FloatField()  # absolute change vs prev close
    volume = serializers.IntegerField()


class IntradayPointSerializer(serializers.Serializer):
    t = serializers.CharField()        # timestamp label (e.g., "10:30", or ISO date)
    price = serializers.FloatField()


class NewsItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    source = serializers.CharField()
    title = serializers.CharField()
    url = serializers.URLField()
    published_at = serializers.DateTimeField()


class SymbolSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    name = serializers.CharField()


class WatchlistItemSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    name = serializers.CharField()
    market = serializers.ChoiceField(choices=["ghana","international"])
    created_at = serializers.DateTimeField(read_only=True)


