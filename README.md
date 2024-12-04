# sUPper

This is a 1-semester project for the course "Internet Programming". It was carried out in collaboration with [Marina Mentou](https://gr.linkedin.com/in/marina-mentou-748a8b1b8).  
It showcases full stack webpage development, from the UI/UX design and style sheet creation, to the forming of the relevant databases and their respective interfaces.

## Features

- A fully working web application for online food ordering and delivery.
- User creation and sign-in
- Sign-up of dedicated drivers.
- Sign-up of restaurants to the service.
- Restaurant management (menu, working hours, etc.).
- Support for reviews by the customers.
- Broadcasting orders to nearby drivers, ability for drivers to pick their orders.

## Technologies employed

- HTML
- CSS
- JavaScript
- NodeJS
- ExpressJS
- Handlebars
- PostgreSQL

## Entity – Relationship Diagram (text in greek)

![web](https://github.com/ChristoforosVlachos/sUPper/assets/96950242/1685ce05-b467-454a-af8f-52f676ae90dd)


## Screenshot

![web2](https://github.com/ChristoforosVlachos/sUPper/assets/96950242/91a7ba50-116f-460d-a980-e4e1c8603616)

## Try it!

### Live

Visit https://supper.onrender.com/  
May take up to 1 minute to fire up the server the first time. Hosted by [Render](https://render.com/); PostgreSQL database on [aiven](https://aiven.io/).

### Localy

On the base folder, run:
```
npm intall
```
and then:
```
node index.mjs
```
Additioanlly, the environment variables "DATABASE_URL" and "SECRET" have to be set.
