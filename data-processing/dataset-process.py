import pandas as pd

pd.options.mode.chained_assignment = None  # default='warn'
pd.options.display.max_rows = 9999

# Import athlete_events dataset
df = pd.read_csv("data-processing/src/athlete_events.csv")

def count_nans_uniques_range(df: pd.DataFrame, output_file: str) -> None:
    # Create a DataFrame to store the counts
    result_df = pd.DataFrame({
        'Column': df.columns,
        'NaN Count': df.isna().sum(),
        'Unique Values Count': df.nunique()
    }).reset_index(drop=True)
    
    # Initialize lists for min and max values
    min_values, max_values = list(), list()
    
    # Loop through each column and calculate min/max for numerical columns
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            min_values.append(df[col].min())
            max_values.append(df[col].max())
        else:
            min_values.append('N/A')
            max_values.append('N/A')
    
    # Add min and max columns to the result DataFrame
    result_df['Min Value'] = min_values
    result_df['Max Value'] = max_values

    # Add total number of rows (create a row with the correct number of columns)
    total_rows = len(df)
    total_row = ['TOTAL ROWS', total_rows, '', '', '']  # Ensure the list matches the number of columns in result_df
    result_df.loc[len(result_df)] = total_row
    
    # Save the result to a CSV file
    result_df.to_csv(output_file, index=False)

def select_features(df: pd.DataFrame, columns) -> pd.DataFrame:
    # Select columns that will be used in the demo/workshop
    return df[columns]

def sentinel_float(df: pd.DataFrame, column: str) -> pd.DataFrame:
    # Replace NaN values with -1.0 (sentinel value)
    df[column] = df[column].fillna(-1.0)  
    return df

def sample_dataset(df: pd.DataFrame) -> pd.DataFrame:
    # Keeping only a sample
    return df.sample(n=1000, random_state=42)

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Pipeline
    return(
        df
        .pipe(select_features, columns = ["ID", "Sex", "Age", "Team", "NOC", "Year", "Season", "Sport", "Medal"])
        #.pipe(sample_dataset)
    )


# INTRODUCTORY OPPERATIONS
# Export report to a csv file about the original data
count_nans_uniques_range(df, 'data-processing/src/metrics/count_nans_uniques_range_original.csv')

# Execute pipeline
df = preprocess_data(df)
print("Pipeline executed successfully!")


# SET THE COUNTRY NAMES USING THE NOC CODE
# Load the noc_regions.csv file
noc_regions_df = pd.read_csv('data-processing/src/noc_regions.csv')

# Merge df with noc_regions_df on the NOC column
df_noc = df.merge(noc_regions_df[['NOC', 'region']], on='NOC', how='left')

# Create the 'Country' column based on the region
df_noc['Country'] = df_noc['region'].fillna('Unknown')

# Get unique countries from 'Country' column
unique_countries = sorted(df_noc['Country'].unique())

# Create a new DataFrame for export
unique_countries_df = pd.DataFrame(unique_countries, columns=['Country'])

# Export to a CSV file
unique_countries_df.to_csv("data-processing/src/metrics/unique_countries.csv", index=False)


# SET THE COUNTRY CODES USING THE ISO3166-1ALPHA3
# Load the iso3166-1a3.csv file
iso3166_df = pd.read_csv('data-processing/src/iso3166-1a3.csv')

# Create the column "Country_code"
df_noc['Country_code'] = df_noc['NOC'].map(iso3166_df.set_index('NOC')['iso3166-1a3'])

print("Country names and codes set successfully!")

# SET THE CONTINENT USING THE ISO3166-1ALPHA3
# Keep only the first occurrence for each iso3166-1a3
iso3166_df_unique = iso3166_df.drop_duplicates(subset='iso3166-1a3', keep='first')
# Assign the new column 'Continent' in df_noc using the dictionary
df_noc['Continent'] = df_noc['Country_code'].map(iso3166_df_unique.set_index('iso3166-1a3')['Continent'])

# CREATE COLUMN 'Host_country' and "Host_country_code"
# Load the host_countries.csv file
host_countries_df = pd.read_csv('data-processing/src/host_countries.csv')

# Perform the join between the DataFrames
df_noc = df_noc.merge( host_countries_df[['Year', 'Season', 'Host_country']],\
                      on=['Year', 'Season'], how='left' )

# Create the column "Host_country_code"
host_countries_df_unique = host_countries_df.drop_duplicates(subset=['Host_country'])
df_noc['Host_country_code'] = df_noc['Host_country'].map(host_countries_df_unique.set_index('Host_country')['Host_country_code'])

# Drop the 'Team' amd 'NOC' columns from df_noc
df_noc.drop(columns=['Team', 'region', 'NOC'], inplace=True)

print("Host countries' names and codes created successfully!")

# CREATE A COLUMN 'Edition'
df_noc['Edition'] = df_noc['Year'].astype(str) + ' ' + df_noc['Host_country']

# ASSIGNMENT OF A VALUE PER MEDAL
# Ensure 'Medal' is a string type
df_noc['Medal'] = df_noc['Medal'].astype(str)

# Map the medal values
df_noc['Medal'] = df_noc['Medal'].map({
    'Gold': 5,
    'Silver': 3,
    'Bronze': 1,
    'nan': 0
}).astype(int)

print("Medal values assigned successfully!")


# QUESTIONS 1, 2 AND 5: PERFORMANCE (MEDAL SCORE)
# Group by 'Country' and 'Year', then calculate the sum of medals
df_noc['Country_performance'] = df_noc.groupby(['Country', 'Year', 'Season'])['Medal']\
    .transform('sum')

# Calculate total rows for each year
total_rows_per_year_country = df_noc.groupby(['Country', 'Year'])['Medal']\
    .transform('count')

# Divide the sum of medals by total rows for that year
df_noc['Country_performance'] = df_noc['Country_performance'] / total_rows_per_year_country

print("Operations on Questions 1, 2 and 5 executed successfully!")

# Export report to a csv file about the proceesed data
count_nans_uniques_range(df_noc, 'data-processing/src/metrics/count_nans_uniques_range_processed.csv')


# EXPORT THE FINAL DATA
df_noc.to_csv('data/dataset.csv', index=False)
df_noc.to_json('data/dataset.json', index=False, orient="records")

print("Final data exported successfully!")