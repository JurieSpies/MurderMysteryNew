"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = exports.GamePhase = void 0;
var GamePhase;
(function (GamePhase) {
    GamePhase["LOBBY"] = "lobby";
    GamePhase["INTRODUCTION"] = "introduction";
    GamePhase["INVESTIGATION"] = "investigation";
    GamePhase["ACCUSATION"] = "accusation";
    GamePhase["REVEAL"] = "reveal";
    GamePhase["FINISHED"] = "finished";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
var SocketEvents;
(function (SocketEvents) {
    SocketEvents["CONNECT"] = "connect";
    SocketEvents["DISCONNECT"] = "disconnect";
    SocketEvents["CREATE_GAME"] = "create_game";
    SocketEvents["JOIN_GAME"] = "join_game";
    SocketEvents["LEAVE_GAME"] = "leave_game";
    SocketEvents["START_GAME"] = "start_game";
    SocketEvents["CHANGE_PHASE"] = "change_phase";
    SocketEvents["ASSIGN_CHARACTER"] = "assign_character";
    SocketEvents["RELEASE_CLUE"] = "release_clue";
    SocketEvents["SEND_MESSAGE"] = "send_message";
    SocketEvents["RECEIVE_MESSAGE"] = "receive_message";
    SocketEvents["SUBMIT_ACCUSATION"] = "submit_accusation";
    SocketEvents["REVEAL_SOLUTION"] = "reveal_solution";
    SocketEvents["GAME_UPDATE"] = "game_update";
    SocketEvents["PLAYER_UPDATE"] = "player_update";
    SocketEvents["ERROR"] = "error";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
//# sourceMappingURL=index.js.map