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
      <div class="container col-md-8 offset-md-2" id="registration-page">
      <h1 class="font-weight-bold text-center registration-header">Register New User</h1>
      <ul v-if=errors class="pl-0">
        <li v-for="(key,value) in errors" class="flash bg-danger">
          {{ key }}
        </li>
      </ul>
      <form method="post" @submit.prevent="register_user" id="registrationForm">
          <div class="form-row">  
              <div class="form-group col-md-6 sm-padding-right">
                  <label for="username">Username</label><br>
                  <input type="text" name="username" class='form-control' required/> 
              </div>
              <div class="form-group col-md-6">
                  <label for="password">Password</label><br>
                  <input type="password" name="password" class='form-control' required/>
              </div>
          </div>
          <div class="form-row">
              <div class="form-group col-md-6 sm-padding-right">
                  <label for="fullname">Fullname</label><br>
                  <input type="text" name="fullname" class='form-control' required/> 
              </div>
              <div class="form-group col-md-6">
                  <label for="email">Email</label><br>
                  <input type="email" name="email" class='form-control' required/>
              </div>
          </div>
          <div class="form-row">
            <div class="form-group col-md-6 sm-padding-right">
              <label for="location">Location</label><br>
              <input type="text" name="location" class='form-control' required/>
            </div>
            <div class="form-group col-md-6">
              
            </div>
          </div>
          <div class="form-group">
              <label for="biography">Biography</label><br>
              <textarea cols="50" rows="2" name="biography" class="form-control" required></textarea>
          </div>
          <div class="form-group">
              <label for="photo"><b>Upload Photo</b></label><br>
              <input type="file" name="photo" required/> 
          </div>
          <div class="text-center">
              <button type="submit" id="submit-button" class="btn bg-info">Register</button>
          </div>
      </form>
    </div>
  `,
  data(){
    return {
      user_data: '',
      errors: {}
    }
  },
  methods: {
    register_user() {
      let form = document.getElementById('registrationForm');
      let form_data = new FormData(form);
      let self = this;
      fetch("/api/register", {
          method: 'POST',
          body: form_data,
          headers: {
              'X-CSRFToken': csrf_token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
          
          if (jsonResponse['id'] && jsonResponse['date_joined']){  // if successful
            self.$router.push('/login')
            self.user_data = jsonResponse
          } else if (jsonResponse['error']){
            self.errors = jsonResponse
          }
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    }
  }
};

const Login = {
  name: 'Login',
  template: `
    <div class="login-form-container center-block">
      <h2>Please Log in</h2>
      <div v-if=message class="flash">
        {{ message }}
      </div>
      <ul v-if=errors class="text-white px-0">
        <li v-for="(key,value) in errors" class="bg-danger flash">
            {{ value }}
        </li> 
      </ul>
      <form method="post" @submit.prevent="login_user" id="loginForm">
        <div class="form-group">
          <label for="username">Username</label><br>
          <input type="text" name="username" class='form-control'/> 
        </div>
        <div class="form-group">
          <label for="password">Password</label><br>
          <input type="password" name="password" class='form-control'/> 
        </div>
        <button type="submit" name="submit-btn" class="btn btn-primary btn-block">Login</button>
      </form>
    </div>
  `,
  data(){
    return {
      message: "",
      errors: [],
      state: false
    }
  },
  methods: {
    login_user() {
      let loginForm = document.getElementById('loginForm');
      let form_data = new FormData(loginForm);
      let self = this;
      fetch("/api/auth/login", {
          method: 'POST',
          body: form_data,
          headers: {
              'X-CSRFToken': csrf_token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
          if (jsonResponse['token']){
            if (typeof(Storage) !== "undefined") {
              localStorage.setItem('united_auto_sales_token', jsonResponse['token']);
            } else {
              console.log('No Web Storage support..');
            }
            self.message = jsonResponse['message'];        
            self.$router.push('/explore');
            self.update_navbar();
          } else {
            self.errors = jsonResponse['error'];
          }
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
  }
};

const Logout = {
  name: 'Logout',
  template: `
  `,
  created(){
    this.$router.push('/');
    this.update_navbar()
  },
  data() {
      return {}
  },
  methods: {
    update_navbar(){
      document.getElementById('logged-out').classList.remove('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.add('d-none');
      }
    }
  }
};

const AddCar = {
  name: 'AddCar',
  template: `
    <div class="container col-md-8 offset-md-2" id="addCar-page">
      <h1 class="font-weight-bold text-center addCar-header">Add New Car</h1>
      <form method="post" @submit.prevent="add_car" id="addCarForm">
          <div class="form-row">  
              <div class="form-group col-md-6 sm-padding-right">
                  <label for="make">Make</label><br>
                  <input type="text" name="make" class='form-control' required/> 
              </div>
              <div class="form-group col-md-6">
                  <label for="model">Model</label><br>
                  <input type="text" name="model" class='form-control' required/>
              </div>
          </div>
          <div class="form-row">
              <div class="form-group col-md-6 sm-padding-right">
                  <label for="colour">Colour</label><br>
                  <input type="text" name="colour" class='form-control' required/> 
              </div>
              <div class="form-group col-md-6">
                  <label for="year">Year</label><br>
                  <input type="text" name="year" class='form-control' required/>
              </div>
          </div>
          <div class="form-row">
            <div class="form-group col-md-6 sm-padding-right">
              <label for="price">Price</label><br>
              <input type="number" name="price" class='form-control' required/>
            </div>
            <div class="form-group col-md-6">
              <label for="carType">Car Type</label><br>
              <select name="carType" id="carType" form="addCarForm" class="w-100">
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Coupe">Coupe</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Van">Van</option>
                <option value="Minivan">Minivan</option>
                <option value="Pickup">Pickup</option>
                <option value="Convertable">Convertable</option>
                <option value="Wagon">Wagon</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col-md-6 sm-padding-right">
              <label for="transmission">Transmission</label><br>
              <select name="transmission" id="transmissionType" form="addCarForm" class="w-100">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div class="form-group col-md-6">
            
            </div>
          </div>
          <div class="form-group">
              <label for="description">Description</label><br>
              <textarea cols="50" rows="2" name="description" class="form-control" required></textarea>
          </div>
          <div class="form-group">
              <label for="photo"><b>Upload Photo</b></label><br>
              <input type="file" name="photo" required/> 
          </div>
          <div class="text-center">
              <button type="submit" id="submit-button" class="btn bg-info">Save</button>
          </div>
      </form>
    </div>
  `,
  data() {
      return {}
  },
  created(){
    this.update_navbar();
  },
  methods: {
    add_car(){
      let form = document.getElementById('addCarForm');
      let form_data = new FormData(form);
      let self = this;
      fetch("/api/cars", {
          method: 'POST',
          body: form_data,
          headers: {
              'X-CSRFToken': csrf_token,
              'Authorization': 'Bearer ' + localStorage.getItem('united_auto_sales_token')
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
          
          if (jsonResponse['user_id'] && jsonResponse['transmission']){  // if successful
            self.$router.push('/explore')
            self.car_data = jsonResponse
          }
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
  }
};

const Explore = {
  name: 'Explore',
  template: `
    <div class="explore px-5">
      <h2>Explore</h2>
      <form class="form-inline d-flex bg-white rounded p-4 justify-content-around">
        <label class="sr-only" for="search-bar-container">Search</label>
        <div class="make-component mr-2">
            <label class="make-label" for="make">Make</label>
            <input type="search" name="make" v-model="make_searchTerm" id="search-make" class="form-control mb-2 mr-sm-2" placeholder="" />
        </div>
        <div class="model-component mr-2">
            <label class="model-label" for="model">Model</label>
            <input type="search" name="model" v-model="model_searchTerm" id="search-model" class="form-control mb-2 mr-sm-2" placeholder="" />
        </div>
        <button class="btn search-btn align-self-end mb-2 px-5 bg-success text-white" @click="">Search</button> 
      <!--
        <div class="form-group d-flex search-bar-container" name="search-bar-container">
          
        </div>
        -->
      </form>


      <!-- HOW CAN BOTH PATHS BE THE SAME? -->
      <a href="static/black_hilux.jpg">path1 </a>
      <a href="../static/black_hilux.jpg">path2</a>

      <div class="cars">
          <div v-for="car in car_data" class="row row-cols-1 row-cols-md-3 g-4">
              <div class="col">
                  <div class="card h-100">
                      <!-- {{ uploads }}{{ car['photo'] }} -->
                      <img src="static/imgs/black_hilux.jpg" class="card-img-top" alt="car photo">
                   
                      <div class="card-body">
                        <div class="d-flex">
                          <h6 class=" mr-auto pt-2">{{ car['year'] }} {{ car['make'] }}</h6>
                          <div id="price-tag" class="badge badge-success px-2 pt-2 text-light md-bold ml-1">
                            <img src="static/imgs/price_tag.svg" alt="price tag" class="pb-1" style="height: 25px;">
                            <span id="price" class="pl-2">&#36{{car['price'] }}</span>
                          </div>
                        </div>
                        <p class="card-text text-muted md-bold">{{ car['model'] }}</p>
                      </div>
                      <div class="card-footer text-center bg-info">
                          View more details
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  `,
  data() {
      return {
        car_data: [],
        make_searchTerm: '',
        model_searchTerm: '',
        uploads: '../../../uploads/cars/'
      }
  },
  created(){
    this.update_navbar();
    let self = this;
    fetch("/api/cars", {
      method: 'GET',
      headers: {
          'X-CSRFToken': csrf_token,
          'Authorization': 'Bearer ' + localStorage.getItem('united_auto_sales_token')
      },
      credentials: 'same-origin'
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (jsonResponse) {
        self.car_data = jsonResponse
        console.log(jsonResponse);
    })
    .catch(function (error) {
        console.log(error);
    });
  },
  methods: {
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
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
  },
  created(){
    this.update_navbar();
  },
  methods: {
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
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
  },
  created(){
    this.update_navbar();
  },
  methods: {
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
  }
};

const NotFound = {
  name: 'NotFound',
  template: `
  <div class="not-found">
    <h1>404</h1>
    <p>That page doesn't even exist.</p>
    <p>Why don't you just <router-link to="/">go back home</router-link></p>
  </div>
  `,
  data() {
      return {}
  },
  created(){
    this.update_navbar();
  },
  methods: {
    update_navbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    }
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
      token: ''
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
          <li class="nav-item d-none dynamic-link">
            <router-link class="nav-link" to="/cars/new">Add Car</router-link>
          </li>
          <li class="nav-item d-none dynamic-link">
          <router-link class="nav-link" to="/explore">Explore</router-link>
          </li>
          <li class="nav-item d-none dynamic-link">
          <router-link class="nav-link" to="/users/:user_id">My Profile</router-link>
          </li>
        </ul>

        <ul class="navbar-nav d-none dynamic-link">
          <li class="nav-item active">
          <router-link class="nav-link" to="/logout">Logout</router-link>
          </li>
        </ul>

        <ul id="logged-out" class="navbar-nav">
          <li class="nav-item active">
            <router-link class="nav-link" to="/register">Register</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
        </ul>
  
      </div>
    </nav>
  `,
  data() {
    return {
      welcome: 'Hello World! Welcome to United Auto Sales',
      token: localStorage.getItem('united_auto_sales_token'),
    }
  }
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
    { path: '/logout', component: Logout },
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