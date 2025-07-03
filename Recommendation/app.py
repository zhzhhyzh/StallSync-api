import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix

# Load rating data
rating = pd.read_csv('ratings.csv', dtype={'Rating': 'float64'})
rating['Rating'] = rating['Rating'].clip(lower=0.0, upper=5.0)

df = pd.read_csv('1662574418893344.csv')  # Contains Food_ID and food metadata

# Filter users and foods with minimal activity
min_user_ratings = 3
min_food_ratings = 5

user_counts = rating['User_ID'].value_counts()
food_counts = rating['Food_ID'].value_counts()

filtered_rating = rating[
    rating['User_ID'].isin(user_counts[user_counts >= min_user_ratings].index) &
    rating['Food_ID'].isin(food_counts[food_counts >= min_food_ratings].index)
]

# Build rating matrix and train NearestNeighbors
rating_matrix = filtered_rating.pivot_table(index='Food_ID', columns='User_ID', values='Rating').fillna(0)
csr_rating_matrix = csr_matrix(rating_matrix.values)
recommender = NearestNeighbors(metric='cosine', n_neighbors=20)
recommender.fit(csr_rating_matrix)

# Cold start fallback: most popular items
def Get_ColdStart_Recommendations(top_k=10):
    popular = (
        rating.groupby('Food_ID')['Rating']
        .count()
        .sort_values(ascending=False)
        .head(top_k)
        .index
        .tolist()
    )
    result_df = pd.DataFrame({'Food_ID': popular})
    result_df = pd.merge(result_df, df, on='Food_ID', how='left')
    return result_df

# Recommend top_k items for a given user
def Get_Recommendations(user_id, top_k=10):
    user_data = filtered_rating[filtered_rating['User_ID'] == user_id]
    if user_data.empty:
        print(f'User_ID {user_id} has no history, using cold start fallback.')
        result_df = Get_ColdStart_Recommendations(top_k)
    else:
        scores = {}
        for _, row in user_data.iterrows():
            food_id = row['Food_ID']
            rating = row['Rating']
            try:
                food_index = np.where(rating_matrix.index == food_id)[0][0]
                distances, indices = recommender.kneighbors(
                    rating_matrix.iloc[food_index].values.reshape(1, -1),
                    n_neighbors=top_k + 1
                )
                neighbors = rating_matrix.iloc[indices[0][1:]].index.tolist()
                for neighbor in neighbors:
                    if neighbor != food_id:
                        scores[neighbor] = scores.get(neighbor, 0) + rating
            except IndexError:
                continue

        # Filter out already rated items
        already_rated = set(user_data['Food_ID'])
        scored_items = [(fid, score) for fid, score in scores.items() if fid not in already_rated]
        sorted_items = sorted(scored_items, key=lambda x: x[1], reverse=True)
        top_items = [fid for fid, _ in sorted_items[:top_k]]

        result_df = pd.DataFrame({'Food_ID': top_items})
        result_df = pd.merge(result_df, df, on='Food_ID', how='left')

    filename = f'recommendations_user_{user_id}.csv'
    result_df.to_csv(filename, index=False)
    print(f'Recommendations saved to {filename}')
    return result_df

# Run recommendation for any users (add more if needed)
if __name__ == "__main__":
    Get_Recommendations(1)
    Get_Recommendations(2)
    Get_Recommendations(3)
    Get_Recommendations(4)
    Get_Recommendations(445)
