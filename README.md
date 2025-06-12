# 3d-school

## npm
```dotenv
npm install --save three
npm install --save-dev vite
```

## For Windows
To start service check ExecutionPolicy of User.
```dotenv
Get-ExecutionPolicy -List
```
##
For Development Policy should be "Unrestricted"
```dotenv
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
```

## start service
```dotenv
Your path \3d-school\frontend> npx vite
```
## story points
Pro Story Point ist ein zeitlicher Aufwand von 8 Stunden bzw. einen Arbeitstag vorgesehen.

## Backend Server
Das Backend wurde auf render.com gehostet.
Da hierzu die kostenlose Variante genutzt wird, kann es zu längeren Ladezeiten kommen.
Offiziel legt sich die Anwendung bzw. der Server schlafen und kann bis
zu 50 Sekunden in Anspruch nehmen, bis die Anwendung wieder bereit ist,
um die Anfrage des Frontends (Routinganfrage) entgegenzunehmen.

## Frontend Server
Das Frontend wurde auf vercel.com gehostet.
Der hierzu lautende Link ist: https://3d-school-pa6c.vercel.app/