import pandas as pd

# Input and output file paths
input_file = 'data-processing/src/gdp_percapita_till-2022.csv'
output_file = 'data/gdp_percapita_1896-2016.csv'
iso_file = 'data-processing/src/iso3166-1a3.csv'

# Load the CSV with the appropriate separator
df = pd.read_csv(input_file, sep=',')

# Load the iso3166-1a3 mapping file
iso_df = pd.read_csv(iso_file, sep=',')

# Create a mapping dictionary from the iso_df
iso_mapping = dict(zip(iso_df['region'], iso_df['iso3166-1a3']))
continent_mapping = dict(zip(iso_df['region'], iso_df['Continent']))  # Assumindo que 'continent' seja o nome da coluna no iso_df

# Add the iso3166-1a3 column and Continent to the main DataFrame
df['Country_code'] = df['Country'].map(iso_mapping)
df['Continent'] = df['Country'].map(continent_mapping)  # Mapeando o continente

# Define the new column order, including 'Country', 'Country_code', 'Continent' and the years
years = list(range(1896, 2017))
columns = ['Country', 'Country_code', 'Continent'] + [str(year) for year in years]

# Write the new CSV with the reordered columns
df.to_csv(output_file, columns=columns, index=False)

print("CSV sub-dataset created successfully!")
