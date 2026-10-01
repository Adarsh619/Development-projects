"""Local analytics; no network, API keys, paid AI or cloud execution."""
import argparse
import json
from pathlib import Path
import pandas as pd

def analyze(path: str) -> dict:
    df = pd.read_csv(path)
    required = {'date', 'merchant', 'amount', 'category', 'kind'}
    if not required.issubset(df.columns):
        raise ValueError('CSV requires date, merchant, amount, category, kind')
    df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d', errors='raise')
    df['amount'] = pd.to_numeric(df['amount'], errors='raise')
    if not df['kind'].isin(['income', 'expense', 'transfer']).all() or (df['amount'] <= 0).any() or not df['amount'].map(lambda x: float('-inf') < x < float('inf')).all():
        raise ValueError('Kinds must be income/expense/transfer; amounts finite and positive')
    df['month'] = df['date'].dt.strftime('%Y-%m')
    financial = df[df['kind'] != 'transfer']
    monthly = financial.pivot_table(index='month', columns='kind', values='amount', aggfunc='sum', fill_value=0)
    for col in ['income', 'expense']:
        if col not in monthly:
            monthly[col] = 0
    monthly['surplus'] = monthly['income'] - monthly['expense']
    expenses = df[df['kind'] == 'expense']
    latest = df['month'].max() if len(df) else ''
    historical = expenses[expenses['month'] < latest].groupby('category')['amount'].agg(['mean', 'count'])
    flags = []
    for _, row in expenses[expenses['month'] == latest].iterrows():
        if row['category'] in historical.index:
            baseline = historical.loc[row['category']]
            if baseline['count'] >= 3 and row['amount'] > 1.8 * baseline['mean']:
                flags.append({'date': row['date'].strftime('%Y-%m-%d'), 'merchant': row['merchant'], 'category': row['category'], 'amount': float(row['amount']), 'baseline': round(float(baseline['mean']), 2)})
    net = float(monthly.tail(3)['surplus'].mean()) if len(monthly) else 0
    return {'currency': 'INR', 'source': 'local CSV', 'monthly': json.loads(monthly.reset_index().to_json(orient='records')), 'categories': expenses.groupby('category')['amount'].sum().to_dict(), 'flags': flags, 'forecast_net_additions': {str(n): round(net*n, 2) for n in [1, 2, 3]}, 'assumptions': 'Last three recorded months average surplus. Transfers excluded. Unchanged income/spending, no interest or inflation. Not investment advice or a prediction.'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('csv')
    parser.add_argument('--output', default='analytics/output.json')
    args = parser.parse_args()
    result = analyze(args.csv)
    Path(args.output).write_text(json.dumps(result, indent=2, allow_nan=False), encoding='utf-8')
    print(f'Wrote local analytics to {args.output}')
