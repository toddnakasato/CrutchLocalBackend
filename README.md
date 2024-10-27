CrutchLocalBackend

```
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/toddnakasato/CrutchLocalBackend.git
git push -u origin main
```

```
npm install express form-data axios dotenv sequelize sqlite3
npm install nodemon@^3.1.7 jest supertest --save-dev
npm install typescript ts-node @types/node @types/express --save-dev
npm install --save-dev @types/jest
npm install --save-dev ts-jest
```

Run Jest Watch and Nodemon
```
npm run test:watch
npm run dev

Package.json 
"scripts": {
	"start": "node src/server.js",
	"dev": "nodemon src/server.js",
	"test": "jest",
	"test:watch": "jest --watch"
},
```

Typescript (tsconfig.json)
```
{
    "compilerOptions": {
        "target": "ES2020",                
        "module": "CommonJS",              
        "outDir": "./dist",                
        "rootDir": "./src",                
        "strict": true,                    
        "esModuleInterop": true,           
        "moduleResolution": "node",        
        "skipLibCheck": true,              
        "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules"]
}
```

```
crutchlocalbackend/
  ├── localData/
  │   └── crutchDb.sqlite
  ├── src/
  │   ├── controllers/
  │   │   ├── salesforceController.ts
  │   │   ├── hubspotController.ts
  │   │   ├── zoomController.ts
  │   │   └── marketoController.ts
  │   ├── routes/
  │   │   ├── salesforceRoutes.ts
  │   │   ├── hubspotRoutes.ts
  │   │   ├── zoomRoutes.ts
  │   │   └── marketoRoutes.ts
  │   ├── services/
  │   │   ├── salesforce/
  │   │   │   ├── salesforceService.ts
  │   │   │   ├── soqlService.ts
  │   │   │   └── toolingService.ts
  │   │   ├── hubspot/
  │   │   │   └── hubspotService.ts
  │   │   ├── zoom/
  │   │   │   └── zoomService.ts
  │   │   └── marketo/
  │   │       └── marketoService.ts
  │   └── server.ts
  └── package.json
```

1. **/controllers**: Handles HTTP request processing with files grouped by logical feature, linking route requests to business logic.

2. **/routes**: Defines and maps API routes, linking them to specific controller functions based on the feature.

3. **/services**: Contains core business logic, external API interactions, and database operations, keeping functionality reusable and separate from HTTP handling.