import csv
import geojson

fieldNames = []
allData = []
with open('NYPD_Motor_Vehicle_Collisions.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    
    for idx, row in enumerate(reader):
        if idx is 0:
            fieldNames = [row[0], row[4], row[5], row[7], row[8], row[9], 'People Injured', 'People Killed']
            print(fieldNames)
        else:
            if sum(list(map(int, row[10:18]))) is not 0 and row[4] is not '' and row[5] is not '':
                date = row[0].split('/')
                if date[2] == '2018' and date[0] == '10':
                    people = list(map(int, row[10:18]))
                    data = [row[0], row[4], row[5], row[7], row[8], row[9], str(sum(people[0:8:2])), str(sum(people[1:8:2]))]
                    allData.append(data)

print(len(allData))

# with open('october.csv', 'w', newline='') as file:
#     writer = csv.DictWriter(file, fieldnames = fieldNames)
#     writer.writeheader()

#     for data in allData:
#         writer.writerow({
#             'DATE': data[0],
#             'LATITUDE': data[1],
#             'LONGITUDE': data[2],
#             'ON STREET NAME': data[3],
#             'CROSS STREET NAME': data[4],
#             'OFF STREET NAME': data[5],
#             'People Injured': int(data[6]),
#             'People Killed': int(data[7])
#         })
allGeo = []

for data in allData:
    coordinates = [[
    [float(data[2])-0.0001, float(data[1])-0.0001],
    [float(data[2])-0.0001, float(data[1])+0.0001],
    [float(data[2])+0.0001, float(data[1])+0.0001],
    [float(data[2])+0.0001, float(data[1])-0.0001],
    [float(data[2])-0.0001, float(data[1])-0.0001]
    ]]
    geo = geojson.Feature(geometry={
        "type": "Polygon", 
        "coordinates": coordinates
    }, properties={
        "Date": data[0],
        "On Street Name": data[3].strip(),
        "Cross Street Name": data[4].strip(),
        "Off Street Name": data[5].strip(),
        "People Injured and Killed": int(data[6])+ int(data[7])
    }, style={
        "fill":"red",
        "stroke-width":1,
        "fill-opacity":0.6
    })
    allGeo.append(geo)
featureCol = geojson.FeatureCollection(allGeo)
with open('october.geojson', 'w') as file:
    geojson.dump(featureCol, file, indent=4)