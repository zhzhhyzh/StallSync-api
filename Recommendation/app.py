import pandas as pd
import numpy as np
import json
import sys
import sys
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix

# Load data
rating = pd.read_csv('ratings.csv', dtype={'Rating': 'float64'})
rating['Rating'] = rating['Rating'].clip(lower=0.0, upper=5.0)
df = pd.read_csv('foods.csv')  # must have Product_ID column

# Build rating matrix
rating_matrix = rating.pivot_table(index='Product_ID', columns='User_ID', values='Rating').fillna(0)
csr_rating_matrix = csr_matrix(rating_matrix.values)
recommender = NearestNeighbors(metric='cosine', n_neighbors=20)
recommender.fit(csr_rating_matrix)

def get_cold_start(top_k=10):
    popular = (
        rating.groupby('Product_ID')['Rating']
        .count()
        .sort_values(ascending=False)
        .head(top_k).index.tolist()
    )
    result_df = pd.DataFrame({'Product_ID': popular})
    result_df = pd.merge(result_df, df, on='Product_ID', how='left')
    return result_df.to_dict(orient='records')
def get_recommendations(user_id, top_k=10):
    user_data = rating[rating['User_ID'] == user_id]

    if user_data.empty:
        return get_cold_start(top_k)

    scores = {}
    for _, row in user_data.iterrows():
        pid = row['Product_ID']
        rating_val = row['Rating']
        if pid not in rating_matrix.index:
            continue
        try:
            index = np.where(rating_matrix.index == pid)[0][0]
            distances, indices = recommender.kneighbors(
                rating_matrix.iloc[index].values.reshape(1, -1),
                n_neighbors=50  # Increase neighborhood search
            )
            neighbors = rating_matrix.iloc[indices[0][1:]].index.tolist()
            for neighbor in neighbors:
                if neighbor != pid:
                    scores[neighbor] = scores.get(neighbor, 0) + rating_val
        except:
            continue

    rated = set(user_data['Product_ID'])
    scored_items = [(pid, score) for pid, score in scores.items() if pid not in rated]
    if not scored_items:
        return get_cold_start(top_k)

    top_items = sorted(scored_items, key=lambda x: x[1], reverse=True)[:top_k]
    top_ids = [pid for pid, _ in top_items]
    result_df = pd.DataFrame({'Product_ID': top_ids})
    result_df = pd.merge(result_df, df, on='Product_ID', how='left')
    return result_df.to_dict(orient='records')
# Entry point
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_id = sys.argv[1].strip()
        result = get_recommendations(user_id)
        print(json.dumps(result))  
    else:
        print(json.dumps([]))
