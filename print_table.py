import mysql.connector
from tabulate import tabulate

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="tinylink"
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM urls")
rows = cursor.fetchall()

headers = [i[0] for i in cursor.description]

print(tabulate(rows, headers=headers, tablefmt="psql"))

cursor.close()
conn.close()
