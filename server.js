import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import router from './src/routes.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Core Middleware & Assets ---

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session secret fallback intended for local development; override via ENV in production
app.use(session({
  secret: process.env.SESSION_SECRET || 'cougarstats_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.use(flash());

/**
 * Exposes flash notification messages to EJS templates via res.locals.
 */
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine Setup ---

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- Custom Middleware ---

/**
 * Logs HTTP request method and URL in development mode only.
 */
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

/**
 * Exposes application environment state and user data to all view render contexts.
 */
app.use((req, res, next) => {
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    res.locals.user = req.session.user || null;

    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// --- Application Routes ---

app.use(router);

// --- Error Handling Pipeline ---

/**
 * Catches unhandled routes and forwards a 404 error to the central handler.
 */
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

/**
 * Centralized application error handler for rendering 404 and 500 error pages.
 */
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    if (NODE_ENV === 'development') {
        console.error('Stack trace:', err.stack);
    }
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        page: 'error',
        error: err.message,
        stack: NODE_ENV === 'development' ? err.stack : null
    });
});

// --- Server Initialization ---

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`CougarStats MVC Server running on http://localhost:${PORT}`);
  });
}

export default app;