/* Add your Application JavaScript */

const Home = {
  name: 'Home',
  template: `
    <div id="home-page-container" class="d-flex">
      <section class="section1">
          <div class="site-info">
              <h1>Buy and sell cars online</h1>
              <p>United auto sales provides the fastest, </p>
          </div>
          <div class="user-auth d-flex">
              <button class="btn">Login</button>
              <button class="btn ml-3">Register</button>
          </div>
      </section>
      <section class="section2">
          <img src="../static/imgs/display_car.jpg" alt="A beautiful car">
      </section>
    </div>
    `,
  data() {
      return {}
  }
};

const Register = {
  name: 'Register',
  template: `
      <div class="register text-center">
        <h1>{{ welcome }}</h1>
      </div>
  `,
  data(){
    return {
      welcome: '<Register form goes here>'
    }
  }
};

const Login = {
  name: 'Login',
  template: `
      <div class="login text-center">
        <h1>{{ welcome }}</h1>
      </div>
  `,
  data(){
    return {
      welcome: '<Login form goes here>'
    }
  }
};

const AddCar = {
  name: 'AddCar',
  template: `
  <div>
      <h1>Add Car</h1>
  </div>
  `,
  data() {
      return {}
  }
};

const Explore = {
  name: 'Explore',
  template: `
  <div>
      <h1>Explore</h1>
  </div>
  `,
  data() {
      return {}
  }
};

const ViewCar = {
  name: 'ViewCar',
  template: `
  <div>
      <h1>View Car</h1>
  </div>
  `,
  data() {
      return {}
  }
};

const ViewProfile = {
  name: 'ViewProfile',
  template: `
  <div>
      <h1>View Profile</h1>
  </div>
  `,
  data() {
      return {}
  }
};

const NotFound = {
  name: 'NotFound',
  template: `
  <div>
      <h1>404 - Not Found</h1>
  </div>
  `,
  data() {
      return {}
  }
};


/* CREATE APP */
const app = Vue.createApp({
  components: {
    'home': Home,
    'login': Login
  },
  data() {
    return {
      welcome: 'Hello World! Welcome to United Auto Sales',
      login: false
    }
  }
});


app.component('app-header', {
  name: 'AppHeader',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <span class="navbar-brand mb-0 site-name-container">
        <img src='../static/imgs/car_icon.svg' id='car_icon' alt="A car icon"/> United Auto Sales
      </span>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
    
        <ul class="navbar-nav mr-auto">
          <li class="nav-item" v-if="login">
            <router-link class="nav-link" to="/cars/new">Add Car</router-link>
          </li>
          <li class="nav-item" v-if="login">
          <router-link class="nav-link" to="/explore">Explore</router-link>
          </li>
          <li class="nav-item" v-if="login">
          <router-link class="nav-link" to="/users/:user_id">My Profile</router-link>
          </li>
        </ul>

        <ul class="navbar-nav"  v-if="login">
          <li class="nav-item">
          <router-link class="nav-link" to="/logout">Logout</router-link>
          </li>
        </ul>

        <ul class="navbar-nav"  v-if="!login">
          <li class="nav-item active">
            <router-link class="nav-link" to="/register">Register</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
        </ul>
        <!--{# {% endif %} #}-->
      </div>
    </nav>
  `
});

app.component('app-footer', {
    name: 'AppFooter',
    template: 
    `
    <footer>
        <div class="container">
        <!-- Footer content goes here -->
        </div>
    </footer>
    `,
    data() {
        return {
            // year: (new Date).getFullYear()
        }
    }
});


// Define Routes
const routes = [
    { path: "/", component: Home },
    // Put other routes here
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/cars/new', component: AddCar },
    { path: '/explore', component: Explore },
    { path: '/logout', component: Home },
    { path: '/cars/:car_id', component: ViewCar },
    { path: '/users/:user_id', component: ViewProfile },

    // This is a catch all route in case none of the above matches
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes, // short for `routes: routes`
});

app.use(router);

app.mount('#app');