import pandas as pd
import numpy as np
import json
import sys
import sys
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix

# --- Load and clean data ---
rating = pd.read_csv('ratings.csv', dtype=str)
df = pd.read_csv('foods.csv', dtype=str)

# Clean whitespace
rating['User_ID'] = rating['User_ID'].str.strip()
rating['Product_ID'] = rating['Product_ID'].str.strip()
df['Product_ID'] = df['Product_ID'].str.strip()

# Convert rating to float and clip
rating['Rating'] = pd.to_numeric(rating['Rating'], errors='coerce').fillna(0).clip(0, 5)

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
        # Product_ID = row['Product_ID']
        Product_ID = row['Product_ID']
        rating_val = row['Rating']
        if Product_ID not in rating_matrix.index:
            continue


        try:
            food_index = np.where(rating_matrix.index == Product_ID)[0][0]
            distances, indices = recommender.kneighbors(
                rating_matrix.iloc[food_index].values.reshape(1, -1),
                n_neighbors=top_k + 1
            )
            neighbors = rating_matrix.iloc[indices[0][1:]].index.tolist()
            for neighbor in neighbors:
                if neighbor != Product_ID:
                    scores[neighbor] = scores.get(neighbor, 0) + rating_val
        except IndexError:
            continue
           

        # Use only the 100 most recent ratings to filter
        already_rated = set(user_data.tail(100)['Product_ID'])

        scored_items = [(fid, score) for fid, score in scores.items() if fid not in already_rated or np.random.rand() > 0.5 ]
        sorted_items = sorted(scored_items, key=lambda x: x[1], reverse=True)
        top_items = [fid for fid, _ in sorted_items[:top_k]]

        if not top_items:
            print(f'No valid personalized recommendations for user {user_id}, using cold start.')
            result_df = get_cold_start(top_k)
        else:
            top_items = sorted(scored_items, key=lambda x: x[1], reverse=True)[:top_k]
            top_ids = [Product_ID for Product_ID, _ in top_items]
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
