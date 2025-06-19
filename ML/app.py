import sys
import json
import pandas as pd
import os
import matplotlib.pyplot as plt
import seaborn as sns
from statsmodels.tsa.arima.model import ARIMA
import warnings

warnings.filterwarnings('ignore')
# Load API Input
def read_input():
    input_data = sys.stdin.read()
    return json.loads(input_data)

# Return JSON Response
def return_json(filename):
    response = {
       "filename": filename
    }
    print(json.dumps(response))
    sys.stdout.flush()



def sales_predict(report_name):
        # Load data
    df = pd.read_csv("./documents/reports/"+report_name)

    # Convert date column
    df['Transaction_Date'] = df['Transaction_Date'].str.replace('/', '-')
    df['Transaction_Date'] = pd.to_datetime(df['Transaction_Date'], format="mixed")

    # Fill missing dates
    date_range = pd.date_range(start=df["Transaction_Date"].min(), end=df["Transaction_Date"].max())
    complete_dates = pd.DataFrame(date_range, columns=["Transaction_Date"])
    df_by_date = df.groupby("Transaction_Date").agg({"Transaction_Amount": ["sum"]}).reset_index()
    df_by_date.columns = ["Transaction_Date", "Transaction_Amount"]
    df_complete = pd.merge(complete_dates, df_by_date, on="Transaction_Date", how="left").fillna(0)

    # Train ARIMA on all available data
    p, d, q = 5, 0, 5
    model = ARIMA(df_complete['Transaction_Amount'], order=(p, d, q))
    model_fit = model.fit()

    # Forecast next 30 days
    forecast_steps = 30
    future_dates = pd.date_range(start=df_complete["Transaction_Date"].iloc[-1] + pd.Timedelta(days=1), periods=forecast_steps)
    forecast_values = model_fit.forecast(steps=forecast_steps)

    # Create forecast DataFrame
    df_forecast = pd.DataFrame({
        "Transaction_Date": future_dates,
        "arima_pred": forecast_values
    })

    base_name = os.path.splitext(report_name)[0]

    # Plot actual + forecast
    plt.figure(figsize=(14, 6))
    sns.lineplot(data=df_complete, x="Transaction_Date", y="Transaction_Amount", label="Actual", color="blue")
    sns.lineplot(data=df_forecast, x="Transaction_Date", y="arima_pred", label="Forecast (Next 30 Days)", color="red", linestyle="dashed")
    plt.title("Sales Forecast for Next 30 Days")
    plt.grid()
    plt.ylim(0)
    plt.xticks(rotation=45)
    plt.savefig("./documents/document_temp/sales-"+base_name+".png", dpi=300)

    # Save forecast to CSV
    df_forecast.to_csv("./documents/forecast_file/forecastSales-"+base_name+".csv", index=False)
    return return_json("sales-"+base_name+".png")
          

def order_predict(report_name):
    # Load data
    df = pd.read_csv("./documents/reports/"+report_name)

    # Convert date column
    df['Transaction_Date'] = df['Transaction_Date'].str.replace('/', '-')
    df['Transaction_Date'] = pd.to_datetime(df['Transaction_Date'], format="mixed")

    # Fill missing dates
    date_range = pd.date_range(start=df["Transaction_Date"].min(), end=df["Transaction_Date"].max())
    complete_dates = pd.DataFrame(date_range, columns=["Transaction_Date"])

    # Count number of orders per day
    df_by_date = df.groupby("Transaction_Date").size().reset_index(name="Order_Count")

    # Merge with full date range
    df_complete = pd.merge(complete_dates, df_by_date, on="Transaction_Date", how="left").fillna(0)

    # Train ARIMA on order count
    p, d, q = 5, 0, 5
    model = ARIMA(df_complete['Order_Count'], order=(p, d, q))
    model_fit = model.fit()

    # Forecast next 30 days
    forecast_steps = 30
    future_dates = pd.date_range(start=df_complete["Transaction_Date"].iloc[-1] + pd.Timedelta(days=1), periods=forecast_steps)
    forecast_values = model_fit.forecast(steps=forecast_steps)

    # Create forecast DataFrame
    df_forecast = pd.DataFrame({
        "Transaction_Date": future_dates,
        "arima_pred": forecast_values
    })

    # Base filename
    base_name = os.path.splitext(os.path.basename(report_name))[0]

    # Plot actual + forecast
    plt.figure(figsize=(14, 6))
    sns.lineplot(data=df_complete, x="Transaction_Date", y="Order_Count", label="Actual", color="blue")
    sns.lineplot(data=df_forecast, x="Transaction_Date", y="arima_pred", label="Forecast (Next 30 Days)", color="red", linestyle="dashed")
    plt.title("Order Forecast for Next 30 Days")
    plt.grid()
    plt.ylim(0)
    plt.xticks(rotation=45)
    plt.savefig("./documents/document_temp/order-" + base_name + ".png", dpi=300)

    # Save forecast to CSV
    df_forecast.to_csv("./documents/forecast_file/forecastOrder-" + base_name + ".csv", index=False)

    return return_json("order-" + base_name + ".png")

if __name__ == "__main__":
    request = read_input()
    print(f"[DEBUG] Incoming request: {request}", file=sys.stderr)
    report_name = request.get("prrptnme")
    forecast_type = request.get("forecast_type")

    if not report_name:
        raise ValueError("Missing 'prrptnme' in input JSON")

    if forecast_type == "S":
        sales_predict(report_name)
    elif forecast_type == "O":
        order_predict(report_name)
    else:
        raise ValueError("Invalid or missing 'forecast_type'. Expected 'S' or 'O'")