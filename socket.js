import { Server } from "socket.io";

let connection = null;

export class Socket {
  
    constructor() {
        this.socket = null;
      }
      connect(server) {
        // console.log(server, "server");
        var io = new Server(server, {
          cors: {
            origin: 
            // "http://localhost:3000",
            process.env.FRONTENDHOST || "http://localhost:3000",
            methods: ["GET", "POST"],
          },
        });
        io.on("connection", (socket) => {
          console.log("user connected");
          this.socket = socket;
        });
      }
      emit(event, data) {
        this.socket.emit(event, data);
      }
      on(userId, data) {
        this.socket.on("userId", (id) => {
             console.log("id user id on", id);
          return data({ userId: id });
        });
      }
      //   on(event, data) {
      //     console.log(data);
      //     return data;
      //     //   console.log(userId, "data", event);
      //     //   userHandler.getUserNotificationsByUserId(userId, "", (res) => {
      //     //     console.log("user notification");
      //     //     // this.socket.emit("FromAPI", res.result.data);
    
      //     // });
      //   }
      static init(server) {
        if (!connection) {
          connection = new Socket();
          connection.connect(server);
        }
      }
      static getConnection() {
        if (connection) {
          return connection;
        }    
      }    
}

 export const socket = { connect: Socket.init, connection: Socket.getConnection };


// let connection = null;
// export class Socket {
//   constructor() {
//     this.socket = null;
//   }
//   connect(server) {
//     // console.log(server, "server");
//     var io = socketO(server, {
//       cors: {
//         origin: 
//         // "http://localhost:3000",
//         process.env.FRONTENDHOST || "http://localhost:3000",
//         methods: ["GET", "POST"],
//       },
//     });
//     io.on("connection", (socket) => {
//       console.log("user connected");
//       this.socket = socket;
//     });
//   }
//   emit(event, data) {
//     this.socket.emit(event, data);
//   }
//   on(userId, data) {
//     this.socket.on("userId", (id) => {
//          console.log("id user id on", id);
//       return data({ userId: id });
//     });
//   }
//   //   on(event, data) {
//   //     console.log(data);
//   //     return data;
//   //     //   console.log(userId, "data", event);
//   //     //   userHandler.getUserNotificationsByUserId(userId, "", (res) => {
//   //     //     console.log("user notification");
//   //     //     // this.socket.emit("FromAPI", res.result.data);

//   //     // });
//   //   }
//   static init(server) {
//     if (!connection) {
//       connection = new Socket();
//       connection.connect(server);
//     }
//   }
//   static getConnection() {
//     if (connection) {
//       return connection;
//     }
//   }
// }
// //export default { connect: Socket.init, connection: Socket.getConnection };

// export const socket = { connect: Socket.init, connection: Socket.getConnection };
