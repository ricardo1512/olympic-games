# olympic-games
APPLICATION "ONE CENTURY OF OLYMPIC GAMES"

Application "One Century of Olympic Games" is a web-based platform designed by Ricardo Vicente in 2024 for seamless performance on modern browsers and serves as a resource for exploring various datasets. This document details supported browsers, used datasets, limitations on data availability, and other essential information. 

The presentation of this application is made in the following video: https://youtu.be/YDZ7IUYcBpw

The "One Century of Olympic Games" is a web application aimed at providing insights into Olympic Games data from 1896 to 2016. It supports modern browsers and is built using JavaScript, HTML, and CSS. The application features various interactive tools and visualizations, including a Choropleth Map, Cleveland Dot Plot, Line Chart, and Scatter Plot. Users can explore data over time using a timeline with a brush, and apply filters to view information by country and season (Winter and Summer). This platform allows for an interactive exploration and analysis of Olympic Games data, offering a detailed view of historical trends and performances across different dimensions, such as continent, gender, sports, and GDP per capita.

1. Supported Browsers
As of October 26, 2024, Application "One Century of Olympic Games" is confirmed to function without issues on the following browser versions:

 Google Chrome: Version 118.0.5993.90
 Mozilla Firefox: Version 119.0
 Safari: 17.1
 Microsoft Edge: Version 118.0.2045.60

If you encounter any issues on these or later versions, please report them to the development team.


2. Data Availability
The following datasets were utilized in this application:

i. Olympics Athletes Events Dataset of 120 years
 - Source: [Kaggle](https://www.kaggle.com/datasets/gauravanand31/olympics-athletes-events-dataset-of-120-years)
 - Type: Static
 - Variables: 15 (ID, Name, Sex, Age, Height, Weight, Team, NOC (National Olympic Committee), Games, Year, Season, City, Sport, Event, Medal)
 - Number of Items: 271,116
 - Format: CSV
 - Note: Country codes are in NOC format.

ii. Host cities for Summer and Winter Olympic Games 
 - Source : [Wikipedia](https://en.wikipedia.org/wiki/List_of_Olympic_Games_host_cities)
 - Type : Static
 - Variables : 3 (Season, Host Country, Year)
 - Number of Items : 52
 - Format : HTML

iii. NOC Regions 
 - Source : [GitHub](https://github.com/prasertcbs/basic-dataset/blob/master/noc_regions.csv)
 - Type : Static
 - Variables : 3 (NOC, Region, Notes)
 - Number of Items : 230
 - Format : CSV

iv. Alpha-3 code 
 - Source : [GitHub](https://gist.github.com/tadast/8827699)
 - Type : Static
 - Variables : 5 (Alpha-2 code, Alpha-3 code, Numeric code, Latitude (average), Longitude (average))
 - Number of Items : 263
 - Format : CSV

v. GeoJSON Countries 
 - Source : [Geojson-maps](https://geojson-maps.kyd.au/)
 - Type : Static
 - Variables : 3 (type, properties, geometry)
 - Number of Items : 255
 - Format : GEOJSON

6. Maddison Project Database 2023 
 - Source : [University of Groningen](https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023)
 - Type : Static
 - Variables : 128 (Country, [...], 2022)
 - Number of Items : 167
 - Format : CSV (Original: XLSX)
 The Maddison Project Database 2023 includes data related to GDP Per Capita; however, comprehensive information is not always available for certain historical periods. Notably, complete data is missing for some years between 1896 and 2016. As a result, users may occasionally find specific GDP Per Capita data absent in the Scatter Plot.


3. Derived Data
To clarify the reasoning behind assigning numerical values to Olympic medals, we can draw a comparison with football scoring. In football, a victory earns a team 3 points, while a tie gives them just 1 point. This reflects a clear hierarchy of success: winning is significantly much more valuable than drawing a match.
In our Olympic medal framework, we want to emphasize that a gold medal is not just slightly better than a silver; it represents a much higher achievement. Thus, we assigned the following values to reflect this hierarchy:

- Gold Medal: 5 points
- Silver Medal: 3 points
- Bronze Medal: 1 point
- No Medal (NaN): 0 points

Key Points of This Scoring System:

i. Magnitude of Achievement: The jump from a silver medal (3 points) to a gold medal (5 points) is not merely a 2-point difference. It signifies the distinction between first and second place, similar to how winning a match is valued much more than just drawing it. This creates a greater disparity in scoring that accurately reflects the competitive nature of the Olympics.
ii. Ordinal Logic: By mapping medals to these specific values, we maintain an ordinal ranking that respects the relative importance of each outcome. Just as a team with multiple wins will have a higher point total than one with ties, a country with several gold medals will clearly outrank those with fewer golds, even if they have more total medals overall.
iii. Enhanced Comparisons: This method allows for a straightforward comparison between countries' performances. For instance, a country with three gold medals and one bronze would have a total of 16 points (3 x 5 + 1), demonstrating its dominance over a country with five silver medals (15 points).

This approach not only captures the competitive essence of the Olympics but also ensures that the scoring system reflects the true accomplishments of athletes in a way that resonates with the principles seen in other competitive sports.

In the end, this summation is divided by the number of athletes in the national delegation, resulting in the Country Performance.

4. Additional Information
Contact and Support: For support, contact ricardo.j.vicente@tecnico.ulisboa.pt.
