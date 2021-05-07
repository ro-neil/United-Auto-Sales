/* Add your Application JavaScript */

function flashMessage(obj, success=true) {
  if (obj.flashMessage){
    obj.displayFlash = true;
    obj.isSuccess = success;
    setTimeout(function() { 
      obj.displayFlash = false;
        sessionStorage.removeItem('flash')
    }, 3000);
  }
}

const Home = {
  name: 'Home',
  template: `
    <div id="home-page-container" class="d-flex">
      <section class="section1">
          <div class="site-info w-75">
              <h1>Buy and Sell <br> Cars Online</h1>
              <p class="py-2">United Auto Sales provides the fastest, easiest and most user friendly way to buy or sell cars online. Find a Great Price on the Vehicle You Want. </p>
          </div>
          <div class="user-auth d-flex ml-0 w-75 pr-5">
            <router-link to="/register" class="w-50">
              <button class="btn register-btn w-100">Register</button>
            </router-link>
            <router-link to="/login" class="w-50 ml-2">
              <button class="btn login-btn w-100">Login</button>
            </router-link> 
          </div>
      </section>
      <section class="section2">
          <img src="../static/imgs/display_car.jpg" alt="A beautiful car">
      </section>
    </div>
    `,
  data() {
      return {
        token: sessionStorage.getItem('united_auto_sales_token')
      }
  },
  created() {
    if (this.token){
      console.log('Please logout to access the homepage.');
      this.$router.push('/explore');
      return
    }
  }
};

const Register = {
  name: 'Register',
  template: `
      <div class="container col-md-8 offset-md-2" id="registration-page">
        <transition name="fade" class="mt-5">
          <div v-if="displayFlash" v-bind:class="[isSuccess ? alertSuccessClass : alertErrorClass]" class="alert">
              {{ flashMessage }}
          </div>
        </transition>
        <h1 class="font-weight-bold registration-header mt-4">Register New User</h1>
        <form method="post" @submit.prevent="register_user" id="registrationForm" class="w-100">
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
                <button type="submit" class="btn submit-button register">Register</button>
            </div>
        </form>
      </div>
  `,
  data(){
    return {
      user_data: '',
      flashMessage: sessionStorage.getItem('flash'),
      displayFlash: false,
      isSuccess: false,
      alertSuccessClass: 'alert-success',
      alertErrorClass: 'alert-danger'
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
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(function (jsonResponse) {
        if (jsonResponse['error']){
          self.displayFlash = true;
          self.flashMessage = jsonResponse['error'];
          setTimeout(function() { 
              self.displayFlash = false;
          }, 3000);
        } else {
            self.$router.push('/login')
            self.user_data = jsonResponse
            sessionStorage.setItem('united_auto_sales_user', JSON.stringify(jsonResponse))
            sessionStorage.setItem('flash','Registered successfully')
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
    <div class="container col-md-8 offset-md-2 login-form-container center-block d-flex flex-column justify-content-center align-items-center">
      <transition name="fade" class="mt-5">
        <div v-if="displayFlash" v-bind:class="[isSuccess ? alertSuccessClass : alertErrorClass]" class="alert">
            {{ flashMessage }}
        </div>
      </transition>
      <h2 class="">Login to your account </h2>
      <form method="post" @submit.prevent="login_user" id="loginForm">
        <div class="form-group">
          <label for="username">Username</label><br>
          <input type="text" name="username" class='form-control' id='usernameField' required/> 
        </div>
        <div class="form-group">
          <label for="password">Password</label><br>
          <input type="password" name="password" class='form-control' required/> 
        </div>
        <button type="submit" name="submit-btn" class="btn submit-button w-100 py-1">Login</button>
      </form>
    </div>
  `,
  created(){
    this.updateNavbar();
    flashMessage(this);
  },
  data(){
    return {
      flashMessage: sessionStorage.getItem('flash'),
      displayFlash: false,
      isSuccess: false,
      alertSuccessClass: 'alert-success',
      alertErrorClass: 'alert-danger'
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
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
      })
      .then(function (jsonResponse) {
          if (jsonResponse['token']){
            if (typeof(Storage) !== "undefined") {
              sessionStorage.setItem('united_auto_sales_token', jsonResponse['token']);
              sessionStorage.setItem('united_auto_sales_user', jsonResponse['user_id']);
            } else {
              console.log('No Web Storage support..');
            }
            self.$router.push('/explore');
            self.updateNavbar();
            sessionStorage.setItem('flash',jsonResponse['message']);
          } else {
            self.displayFlash = true;
            self.flashMessage = jsonResponse['error'];
            setTimeout(function() { 
                self.displayFlash = false;
            }, 3000);
          }
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    updateNavbar(){
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
    if (!this.token){
      this.$router.push('/login')
      return
    }
    let self = this;
    fetch("/api/auth/logout", {
      method: 'POST',
      headers: {
          'X-CSRFToken': csrf_token,
          'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
      },
      credentials: 'same-origin'
    })
    .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
    })
    .then(function (jsonResponse) {
        self.$router.push('/');
        self.updateNavbar();
        sessionStorage.removeItem('united_auto_sales_token');
        sessionStorage.removeItem('united_auto_sales_user');
        sessionStorage.removeItem('flash');
        self.message = jsonResponse['message'];
    })
    .catch(function (error) {
        console.log(error);
    });
  },
  data() {
      return {
        message: '',
        token: sessionStorage.getItem('united_auto_sales_token')
      }
  },
  methods: {
    updateNavbar(){
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
    <div v-if=token class="container col-md-8 offset-md-2" id="addCar-page">
      <transition name="fade" class="mt-5">
        <div v-if="displayFlash" v-bind:class="[isSuccess ? alertSuccessClass : alertErrorClass]" class="alert">
            {{ flashMessage }}
        </div>
      </transition>
      <h1 class="font-weight-bold addCar-header mt-4">Add New Car</h1>
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
              <input type="number" step="any" name="price" class='form-control' required/>
            </div>
            <div class="form-group col-md-6">
              <label for="carType">Car Type</label><br>
              <select name="carType" id="carType" form="addCarForm" class="w-100 form-control">
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
              <select name="transmission" id="transmissionType" form="addCarForm" class="w-100 form-control">
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
          <div class="">
              <button type="submit" class="btn submit-button">Save</button>
          </div>
      </form>
    </div>
  `,
  data() {
      return {
        token: sessionStorage.getItem('united_auto_sales_token'),
        flashMessage: sessionStorage.getItem('flash'),
        displayFlash: false,
        isSuccess: false,
        alertSuccessClass: 'alert-success',
        alertErrorClass: 'alert-danger'
      }
  },
  created(){
    if (!this.token){
      this.$router.push('/login')
      return
    }
    this.updateNavbar();
    flashMessage(this)
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
              'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          if (!response.ok) {
            sessionStorage.setItem('flash', "Car could not be added")
            self.$router.push('/explore')
            throw Error(response.statusText);
          }
          return response.json();
      })
      .then(function (jsonResponse) {
          self.car_data = jsonResponse
          sessionStorage.setItem('flash', "Car succesfully added")
          self.$router.push('/explore')
      })
      .catch(function (error) {
          console.log('Looks like there was a problem: \n', error);
      });
    },
    updateNavbar(){
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
    <div v-if=token class="explore px-5 mx-auto pb-5">
      <transition name="fade" class="mt-5">
        <div v-if="displayFlash" v-bind:class="[isSuccess ? alertSuccessClass : alertErrorClass]" class="alert">
            {{ flashMessage }}
        </div>
      </transition>
      <h1 class="pb-2">Explore</h1>
      <form id='search-form' method="get" @submit.prevent="search" class="form-inline d-flex bg-white rounded p-4 justify-content-around mb-5">
        <label class="sr-only" for="search-bar-container">Search</label>
        <div class="make-component mr-2">
            <label class="make-label" for="make">Make</label>
            <input type="search" name="make" v-model="make_searchTerm" id="search-make" class="form-control mb-2 mr-sm-2" placeholder="" />
        </div>
        <div class="model-component mr-2">
            <label class="model-label" for="model">Model</label>
            <input type="search" name="model" v-model="model_searchTerm" id="search-model" class="form-control mb-2 mr-sm-2" placeholder="" />
        </div>
        <button type="submit" class="btn search-btn align-self-end mb-2 px-5 text-white">Search</button> 
      </form>

      <h3 id='empty-search' class='text-center d-none'>Sorry, we don't have that vehicle.</h3>
      
      <div class="cars">
        <div v-for="car in car_data" class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col">
            <div class="card h-100">
              <img :src="car['photo']" class="card-img-top" alt="car photo">  
              <div class="card-body px-2">
                <div class="d-flex">
                  <h6 class=" mr-auto pt-2">{{ car['year'] }} {{ car['make'] }}</h6>
                  <div id="price-tag" class="badge px-2 pt-2 text-light md-bold ml-1">
                    <img src="../static/imgs/price_tag.svg" alt="price tag" class="pb-1" style="height: 25px;">
                    <span id="price" class="pl-2">&#36{{ car['price'] }}</span>
                  </div>
                </div>
                <p class="card-text text-muted md-bold">{{ car['model'] }}</p>
              </div>

              <div class="card-footer btn submit-button text-center" v-bind:id="car['id']" @click="getID($event)">
                  View more details
              </div>
              
            </div>
          </div>
        </div>
      </div> 
    </div>
  `,
  created(){
    if (!this.token){
      this.$router.push('/login');
      return
    }
    let self = this;
    self.updateNavbar();
    flashMessage(self);
    fetch("/api/cars", {
      method: 'GET',
      headers: {
          'X-CSRFToken': csrf_token,
          'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
      },
      credentials: 'same-origin'
    })
    .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
    })
    .then(function (jsonResponse) {
        self.car_data = jsonResponse;
        if(jsonResponse['message']){
          self.car_data = []
        }
        console.log(jsonResponse);
    })
    .catch(function (error) {
        console.log(error);
    });
  },
  methods: {
    updateNavbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      } 
    },
    getID:function(event){
      targetId = event.currentTarget.id;
      this.$router.push(`/cars/${targetId}`)
    },
    search(){
      let self = this;
      fetch("/api/search?make="+self.make_searchTerm+'&model='+self.model_searchTerm, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
            'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
        },
        credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
          if(jsonResponse.length === 0){
            document.getElementById('empty-search').classList.remove('d-none');
          } else{
            document.getElementById('empty-search').classList.add('d-none');
          }
          self.car_data = jsonResponse;
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    }
  },
  data() {
    return {
      car_data: [],
      make_searchTerm: '',
      model_searchTerm: '',
      token: sessionStorage.getItem('united_auto_sales_token'),
      flashMessage: sessionStorage.getItem('flash'),
      displayFlash: false,
      isSuccess: false,
      alertSuccessClass: 'alert-success',
      alertErrorClass: 'alert-danger'
    }
  }
};

const ViewCar = {
  name: 'ViewCar',
  template: `
    <div class="view-car-container d-flex ml-auto mr-auto">
      <section class="view-car-img-container">
        <img :src="car['photo']" id='view-car-img' class="" alt="Car Photo">
      </section>
      <section class="view-car-info-container p-4 pb-3 w-100 d-flex flex-column">
        <p class="year-make">{{car['year']}}  {{car['make']}}</p>
        <p class="model">{{car['model']}}</p>
        <p class="description gray">{{car['description']}}</p>
        <div class="additional-info">
          <p class="color gray">Color</p>
          <p class="color value">{{car['colour']}}</p>
          <p class="body-type gray">Body Type</p>
          <p class="body-type value">{{car['car_type']}}</p>
          <p class="price gray">Price</p>
          <p class="price value">&#36{{car['price']}}</p>
          <p class="transmission gray">Transmission</p>
          <p class="transmission value">{{car['transmission']}}</p>
        </div>
        <div class='view-car-footer d-flex justify-content-between align-items-end h-100'>
          <a href="mailto:owner@realestate.com" class="btn submit-button" id='email-owner-btn'>Email Owner</a>
          <transition name="fade" class="mt-5 ml-auto mr-auto" id='view-car-flash'>
            <div v-if="displayFlash" v-bind:class="[isSuccess ? alertSuccessClass : alertErrorClass]" class="alert">
                {{ flashMessage }}
            </div>
          </transition>
          <heart @click=addToFavourites></heart>
        </div>
      </section>
    </div>
  `,
  data() {
      return {
        car:[],
        flashMessage: sessionStorage.getItem('flash'),
        displayFlash: false,
        isSuccess: false,
        alertSuccessClass: 'alert-success',
        alertErrorClass: 'alert-danger'
      }
  },
  created(){
    this.updateNavbar();
    let self = this;
    self.fetchCar(self);
    flashMessage(self);
  },
  methods: {
    updateNavbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    },
    fetchCar(self){
      fetch(`/api/cars/${this.$route.params.car_id}`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
            'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
        },
        credentials: 'same-origin'
      })
      .then(function (response) {
        return response.json();
        })
      .then(function (response) {
        self.car = response;
        console.log(response);
      })
    },
    addToFavourites() {
      let self = this;
      fetch(`/api/cars/${this.$route.params.car_id}/favourite`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf_token,
            'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
        },
        credentials: 'same-origin'
      })
      .then(function (response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
      })
      .then(function (jsonResponse) {
          self.displayFlash = true;
          self.isSuccess = true;
          self.flashMessage = jsonResponse['message'];
          setTimeout(function() { 
              self.displayFlash = false; 
          }, 3000);
          console.log(jsonResponse)
      })
      .catch(function (error) {
          console.log(error);
      });
    }
  }
};

const ViewProfile = {
  name: 'ViewProfile',
  template: `
    <div class="profile-page d-flex flex-column">
      <div class="profile-container mb-4 d-flex justify-content-start">
          <div class="profile-left px-3 pt-3 d-flex justify-content-center">
            <div class="img-container border rounded-circle">
              <img :src="user_data['photo']" alt="Profile Picture" class="rounded-circle w-100 h-100">
            </div>
          </div>
          <div class="profile-right">
            <h1 class="m-0 bold">{{ user_data['name'] }}</h1>
            <h2 class="bold">@{{ user_data['username'] }}</h2>
            <p class="py-2 text-muted bio">{{ user_data['biography'] }}</p>
            <div class="user-info mb-3">
                <span class="key">Email</span>
                <span class='value'>{{ user_data['email'] }}</span>
                <span class="key">Location</span>
                <span class='value'>{{ user_data['location'] }}</span>

                <span class="key">Joined</span>
                <span class='value'>{{ formatDate(user_data['date_joined']) }}</span>
            </div>
          </div>
      </div>

      <h2 class='bold'>Cars Favourited</h2>

      <div class="cars">
        <div v-for="car in car_data" class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col">
            <div class="card h-100">

              <img :src="car['photo']" class="card-img-top" alt="car photo">
            
              <div class="card-body">
                <div class="d-flex">
                  <h6 class=" mr-auto pt-2">{{ car['year'] }} {{ car['make'] }}</h6>
                  <div id="price-tag" class="badge px-2 pt-2 text-light md-bold ml-1">
                    <img src="../static/imgs/price_tag.svg" alt="price tag" class="pb-1" style="height: 25px;">
                    <span id="price" class="pl-2">&#36{{car['price'] }}</span>
                  </div>
                </div>
                <p class="card-text text-muted md-bold">{{ car['model'] }}</p>
              </div>
              <div class="card-footer btn submit-button text-center" v-bind:id="car['id']" @click="getID($event)">
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
        token: sessionStorage.getItem('united_auto_sales_token'),
        user_id: sessionStorage.getItem('united_auto_sales_user'),
        user_data: [],
        car_data: []
      }
  },
  created(){
    if (!this.token){
      this.$router.push('/login')
      return
    }
    let self = this;
    self.updateNavbar();
    self.fetchUser(self);
    self.fetchFavourites(self);
  },
  methods: {
    updateNavbar(){
      document.getElementById('logged-out').classList.add('d-none');
      let navItems = document.getElementsByClassName('dynamic-link');
      for (let element = 0; element < navItems.length; element++) {
        navItems[element].classList.remove('d-none');
      }
    },
    formatDate(date_joined){
      let date = (new Date(date_joined)).toDateString().split(" ");
      return `${date[1]} ${date[2]}, ${date[3]}`;
    },
    fetchUser(self){
      fetch(`/api/users/${self.user_id}`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
            'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
        },
        credentials: 'same-origin'
      })
      .then(function (response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
      })
      .then(function (jsonResponse) {
          self.user_data = jsonResponse;
          console.log(jsonResponse)
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    fetchFavourites(self){
      fetch(`/api/users/${self.user_id}/favourites`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
            'Authorization': 'Bearer ' + sessionStorage.getItem('united_auto_sales_token')
        },
        credentials: 'same-origin'
      })
      .then(function (response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
      })
      .then(function (jsonResponse) {
          self.car_data = jsonResponse;
          console.log(jsonResponse)
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    getID:function(event){
      targetId = event.currentTarget.id;
      this.$router.push(`/cars/${targetId}`)
    },
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
    if (this.token){
      this.updateNavbar();
    }
  },
  methods: {
    updateNavbar(){
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
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
      <span class="navbar-brand mb-0">
        <img src='../static/imgs/car_icon.svg' id='car_icon' class="pb-1" alt="A car icon"/>
        <span id="website-name">United Auto Sales</span>
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
      token: sessionStorage.getItem('united_auto_sales_token'),
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

app.component('heart', {
  name: 'heart',
  template:
  `
  <div @click="change" id="heart-container" class="border rounded-circle d-flex justify-content-center align-items-center">
        <img src="../static/imgs/favourite_empty.svg" alt="empty heart icon" id="heart-empty" class="heart">
        <img src="../static/imgs/favourite_filled.svg" alt="empty heart icon" id="heart-filled" class="heart d-none">
  </div>
  
  `,
  methods: {
    change(){
      let hearts = document.getElementsByClassName('heart');
      let container = document.getElementById('heart-container');
      for(let heart of hearts){
        if(heart.classList.contains('d-none')){
          heart.classList.remove('d-none');
          container.style.backgroundColor = "rgba(228, 179, 99, 0.8)";
      }else{
          heart.classList.add('d-none');
          container.style.backgroundColor = "#ffffff";
      }
      }
    }
  }
})

// Define Routes
const routes = [
    { path: "/", component: Home },
    // Put other routes here
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/cars/new', component: AddCar },
    { path: '/explore', component: Explore },
    { path: '/explore/Login Successful', component: Explore },
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