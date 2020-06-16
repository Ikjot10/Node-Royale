// Public Variables
var profileUser;

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    return (
      <div id="ui_login" style={{ textAlign: "center" }} className="form-style">
        <h1>Welcome! Please Login or Register</h1>
        <div>
          <form id="loginForm" onSubmit={this.props.doLogin}>
            <p>
              <label htmlFor="user">
                User Name:{" "}
                <abbr title="This field is mandatory" aria-label="required">
                  *
                </abbr>
              </label>
              <input
                type="text"
                className="input-field"
                id="user"
                name="user"
                placeholder="User Name"
                required
              />
            </p>
            <p>
              <label htmlFor="password">
                Password:{" "}
                <abbr title="This field is mandatory" aria-label="required">
                  *
                </abbr>
              </label>
              <input
                type="password"
                className="input-field"
                id="password"
                name="password"
                placeholder="Password"
                required
              />
            </p>
            <p>
              <input type="submit" id="loginSubmit" value="Login" />
            </p>
          </form>
          <button id="registerSubmiter" onClick={this.props.movetoReg}>
            Register
          </button>
        </div>

        <h1>Leaderboard</h1>
        <p id="leaderLabel">User.....Kills</p>
        <div id="leaderboard"></div>
      </div>
    );
  }
}

class Register extends React.Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    return (
      <div
        id="ui_register"
        style={{ textAlign: "center" }}
        className="form-style"
      >
        <h1>Registration Form</h1>
        <form id="regForm" onSubmit={this.props.doRegister}>
          <p>
            <label htmlFor="userForm">
              User Name:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="text"
              className="input-field"
              id="userForm"
              name="userName"
              placeholder="Username"
              required
            />
          </p>
          <p>
            <label htmlFor="emailForm">
              Email:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="email"
              className="input-field"
              id="emailForm"
              name="userEmail"
              placeholder="Email"
              required
            />
          </p>
          <p>
            <label htmlFor="passForm">
              Password:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="password"
              className="input-field"
              id="passForm"
              name="userPass"
              placeholder="Password"
              required
            />
          </p>
          <p>
            <label htmlFor="passForm2">
              Enter Password Again:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="password"
              className="input-field"
              id="passForm2"
              name="userPass2"
              placeholder="Enter Password Again"
              required
            />
          </p>
          <p>
            <button id="register">Register</button>
          </p>
        </form>
        <button id="loginBtn" onClick={this.props.movetoLogin}>
          Back to Login
        </button>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
  }

  // Load game after component loaded
  componentDidMount(props) {
    toGame(this.props.serverNum);
  }

  leaveGame() {
    // Player leaves here
    socket.send(
      JSON.stringify({ type: "disconnect", cid: -1, id: cid, sid: sid })
    );
    stage = null;
    view = null;
    interval = null;
    stage_element = null;

    this.props.movetoServer();
  }

  render(props) {
    // Styles
    const gameStyle = {
      border: "1px solid black",
      background: "black",
      width: "1100px",
      height: "650px",
      overflow: "hidden",
    };

    const mobileStyle = {
      position: "fixed",
      bottom: "0",
      right: "0",
      height: "225px",
      width: "225px",
      visibility: "hidden",
    };

    return (
      <div id="ui_game">
        <center>
          <h1>Fortnite</h1>
          <button id="leaveGame" onClick={() => this.leaveGame()}>
            Leave Game
          </button>

          <div id="canvasdiv" style={gameStyle}>
            <canvas id="stage" width="3000" height="1600">
              {" "}
            </canvas>
          </div>
        </center>
      </div>
    );
  }
}

class Servers extends React.Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    return (
      <div id="ui_servers">
        <h1>Select World</h1>
        <center>
          <div id="serversDiv">
            <button id="profileBtn" onClick={this.props.movetoProfile}>
              My profile
            </button>
            <br />
            <button
              style={{ fontSize: "20px" }}
              onClick={this.props.OnClickWorld1}
            >
              World 1
            </button>
            <button
              style={{ fontSize: "20px" }}
              onClick={this.props.OnClickWorld2}
            >
              World 2
            </button>
          </div>
        </center>
      </div>
    );
  }
}

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  // Prefill information after loaded
  componentDidMount(props) {
    $.ajax({
      method: "GET",
      url: "/ftd/api/user/" + profileUser + "/",
      data: {},
    })
      .done(function (data, text_status, jqXHR) {
        console.log(JSON.stringify(data));
        console.log(text_status);
        console.log(jqXHR.status);

        $("#userProfile").val(data.Name);
        $("#emailProfile").val(data.Email);
        // $("#killStat").text("Total Kills: " + data.numKills + " ");
        $("#deathStat").text("Total Deaths: " + data.numDeaths);
        $("#oldpassProfile").val("");
        $("#passProfile").val("");
        $("#passProfile2").val("");
      })
      .fail(function (err) {
        alert("Something went wrong!");
        console.log(err.status);
        console.log(JSON.stringify(err.responseJSON));
      });
  }

  render(props) {
    return (
      <div
        id="ui_profile"
        style={{ textAlign: "center" }}
        className="form-style"
      >
        <h1>Profile</h1>
        <div id="stats">
          <h3>Stats</h3>
          <span id="killStat">Total Kills: </span>
          <span id="deathStat">Total Deaths: </span>
        </div>
        <h6>
          To update Username or Email, please enter your password in all 3
          password fields
        </h6>
        <form id="profileForm" onSubmit={this.props.doUpdate}>
          <p>
            <label htmlFor="userProfile">
              User Name:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="text"
              className="input-field"
              id="userProfile"
              name="userName"
              required
            />
          </p>
          <p>
            <label htmlFor="emailProfile">
              Email:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="email"
              className="input-field"
              id="emailProfile"
              name="userEmail"
              required
            />
          </p>
          <p>
            <label htmlFor="oldpassProfile">
              Old Password:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="password"
              className="input-field"
              id="oldpassProfile"
              name="userPass"
              placeholder="Enter old Password"
              required
            />
          </p>
          <p>
            <label htmlFor="passProfile">
              New Password:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="password"
              className="input-field"
              id="passProfile"
              name="userPass"
              placeholder="Password"
              required
            />
          </p>
          <p>
            <label htmlFor="passProfile2">
              Enter New Password Again:{" "}
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </label>
            <input
              type="password"
              className="input-field"
              id="passProfile2"
              name="userPass2"
              placeholder="Enter Password Again"
              required
            />
          </p>
          <p>
            <button id="profile">Update Profile</button>
          </p>
        </form>
        <button id="backtogameBtn" onClick={this.props.movetoServer}>
          Back to Game
        </button>
        <button id="logoutBtn" onClick={this.props.movetoLogin}>
          Logout
        </button>
        <button id="deleteBtn" onClick={this.props.doDelete}>
          Delete Profile
        </button>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    // Set State
    this.state = {
      error: null,
      inGame: false,
      inReg: false,
      inServer: false,
      inLogin: true,
      inProfile: false,
      serverNum: 0,
    };

    // Bind handlers
    this.movetoReg = this.movetoReg.bind(this);
    this.movetoLogin = this.movetoLogin.bind(this);
    this.movetoGame = this.movetoGame.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doRegister = this.doRegister.bind(this);
    this.doDelete = this.doDelete.bind(this);
    this.doUpdate = this.doUpdate.bind(this);
    this.movetoServer = this.movetoServer.bind(this);
    this.OnClickWorld1 = this.OnClickWorld1.bind(this);
    this.OnClickWorld2 = this.OnClickWorld2.bind(this);
    this.movetoProfile = this.movetoProfile.bind(this);
  }

  // Transition functions
  movetoReg() {
    this.setState((state) => ({
      inLogin: false,
      inReg: true,
    }));
  }

  movetoLogin() {
    this.setState((state) => ({
      inLogin: true,
      inReg: false,
      inProfile: false,
    }));
    populateLeaderboard();
  }

  movetoGame() {
    this.setState((state) => ({
      inLogin: false,
      inReg: false,
      inServer: false,
      inGame: true,
    }));
  }

  movetoServer() {
    this.setState((state) => ({
      inLogin: false,
      inReg: false,
      inGame: false,
      inServer: true,
    }));
  }

  movetoProfile() {
    this.setState((state) => ({
      inGame: false,
      inServer: false,
      inProfile: true,
    }));
  }

  // Server deciding handlers
  OnClickWorld1() {
    this.setState((state) => ({
      serverNum: 1,
    }));
    this.movetoGame();
  }

  OnClickWorld2() {
    this.setState((state) => ({
      serverNum: 2,
    }));
    this.movetoGame();
  }

  // Login
  doLogin(event) {
    event.preventDefault();
    var userName = $("#user").val();
    var userPassword = $("#password").val();

    $.ajax({
      method: "POST",
      url: "/ftd/api/login/" + userName + "/",
      data: { userPass: userPassword },
    })
      .done((data, text_status, jqXHR) => {
        console.log(JSON.stringify(data));
        console.log(text_status);
        console.log(jqXHR.status);

        // Check if incorrect password
        if (data.error) {
          alert("Incorrect Username or Password");
          $("#password").val("");
          $("#user").addClass("error");
          $("#password").addClass("error");
        } else {
          profileUser = userName;
          this.movetoServer();
        }
      })
      .fail(function (err) {
        console.log(err.status);
        console.log(JSON.stringify(err.responseJSON));
        $("#user").addClass("error");
        $("#password").addClass("error");
        alert("Incorrect Username or Password");
      });
  }

  // Register
  doRegister(event) {
    // Validate register
    var userName = $("#userForm").val();
    var userEmail = $("#emailForm").val();
    var userPass = $("#passForm").val();
    var userPass2 = $("#passForm2").val();

    if (userPass != userPass2) {
      event.preventDefault();
      alert("Passwords Do Not Match!");
      $("#passForm").addClass("error");
      $("#passForm2").addClass("error");
      return;
    }

    event.preventDefault();
    // Register user
    $.ajax({
      method: "POST",
      url: "/ftd/api/users/",
      data: { name: userName, password: userPass, email: userEmail },
    })
      .done((data, text_status, jqXHR) => {
        console.log(JSON.stringify(data));
        console.log(text_status);
        console.log(jqXHR.status);

        profileUser = userName;
        $("#userForm").removeClass("error");
        $("#passForm").removeClass("error");
        $("#passForm2").removeClass("error");

        this.movetoServer();
      })
      .fail(function (err) {
        console.log(err.status);
        console.log(JSON.stringify(err.responseJSON));
        if (err.status == 409) {
          alert("This username has already been taken");
          $("#userForm").addClass("error");
        }
      });
  }

  // Delete profile
  doDelete() {
    var useroldPass = $("#oldpassProfile").val();

    if (useroldPass == "") {
      alert("Please enter your password");
      return;
    }

    // Check if password is correct
    $.ajax({
      method: "POST",
      url: "/ftd/api/login/" + profileUser + "/",
      data: { userPass: useroldPass },
    })
      .done((data, text_status, jqXHR) => {
        console.log(JSON.stringify(data));
        console.log(text_status);
        console.log(jqXHR.status);

        // Incorrect password
        if (data.error) {
          $("#oldpassProfile").val("");
          alert("Password is incorrect");
          return;
        }
        // Delete Profile
        else {
          $.ajax({
            method: "DELETE",
            url: "/ftd/api/users/",
            data: { name: profileUser },
          })
            .done((data, text_status, jqXHR) => {
              console.log(JSON.stringify(data));
              console.log(text_status);
              console.log(jqXHR.status);

              profileUser = "";
              this.movetoLogin();
            })
            .fail(function (err) {
              console.log(err.status);
              console.log(JSON.stringify(err.responseJSON));
              alert("Something went wrong! No changes were made");
            });
        }
      })
      .fail(function (err) {
        console.log(err.status);
        console.log(JSON.stringify(err.responseJSON));
        $("#oldpassProfile").val("");
        alert("Password is incorrect");
      });
  }

  doUpdate(event) {
    // Validate passwords
    var userName = $("#userProfile").val();
    var userEmail = $("#emailProfile").val();
    var useroldPass = $("#oldpassProfile").val();
    var userPass = $("#passProfile").val();
    var userPass2 = $("#passProfile2").val();

    if (userPass != userPass2) {
      event.preventDefault();
      alert("Passwords Do Not Match!");
      $("#passProfile").addClass("error");
      $("#passProfile2").addClass("error");
      return;
    }

    event.preventDefault();

    // Update Profile
    // Check if password is correct
    $.ajax({
      method: "POST",
      url: "/ftd/api/login/" + profileUser + "/",
      data: { userPass: useroldPass },
    })
      .done((data, text_status, jqXHR) => {
        console.log(JSON.stringify(data));
        console.log(text_status);
        console.log(jqXHR.status);

        // Incorrect password
        if (data.error) {
          $("#oldpassProfile").val("");
          $("#oldpassProfile").addClass("error");

          $("#passProfile").val("");
          $("#passProfile2").val("");
          alert("Password is incorrect");
          return;
        }
        // Update Profile
        else {
          $.ajax({
            method: "PUT",
            url: "/ftd/api/user/" + profileUser + "/",
            data: { name: userName, password: userPass, email: userEmail },
          })
            .done((data, text_status, jqXHR) => {
              console.log(JSON.stringify(data));
              console.log(text_status);
              console.log(jqXHR.status);

              profileUser = userName;
              alert("Profile has been updated!");
            })
            .fail(function (err) {
              console.log(err.status);
              console.log(JSON.stringify(err.responseJSON));

              // Username taken
              if (err.status == 409) {
                alert("Sorry! That username already exists");
                $("#userProfile").addClass("error");
              } else {
                alert("Something went wrong! No changes were made");
              }
            });
        }
      })
      .fail(function (err) {
        console.log(err.status);
        console.log(JSON.stringify(err.responseJSON));
        $("#oldpassProfile").val("");
        $("#oldpassProfile").addClass("error");
        $("#passProfile").val("");
        $("#passProfile2").val("");
        alert("Password is incorrect");
      });
  }

  render() {
    const {
      err,
      inGame,
      inReg,
      inLogin,
      inServer,
      serverNum,
      inProfile,
    } = this.state;

    if (inLogin) {
      return <Login movetoReg={this.movetoReg} doLogin={this.doLogin} />;
    } else if (inReg) {
      return (
        <Register movetoLogin={this.movetoLogin} doRegister={this.doRegister} />
      );
    } else if (inGame) {
      return <Game serverNum={serverNum} movetoServer={this.movetoServer} />;
    } else if (inServer) {
      return (
        <Servers
          OnClickWorld1={this.OnClickWorld1}
          OnClickWorld2={this.OnClickWorld2}
          movetoProfile={this.movetoProfile}
        />
      );
    } else if (inProfile) {
      return (
        <Profile
          movetoLogin={this.movetoLogin}
          doDelete={this.doDelete}
          doUpdate={this.doUpdate}
          movetoServer={this.movetoServer}
        />
      );
    }
  }
}
ReactDOM.render(<App />, document.getElementById("Game"));
