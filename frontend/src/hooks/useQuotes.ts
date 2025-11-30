'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/api';
import type { Market, Quote } from '@/lib/api-types';


export function useQuotes(market: Market) {
const key = `/api/quotes?market=${market}`;
const { data, error, isLoading, mutate } = useSWR<Quote[]>(key, apiGet);
return { quotes: data ?? [], error, isLoading, refresh: mutate };
}