/**
 * Created by Maple on 8/23/15.
 */

/**
 * 负责战斗用户操作 包括进行战斗、使用道具、更换精灵、逃跑 等等
 */
var BattleOperationViewController = mw.ViewController.extend({
    TEXTURES_TO_LOAD: {
        "textures/common.plist": "textures/common.pvr.ccz",
    },
    CCS_NAMES: {
        BG: "bg",
            BTN_BATTLE: "btn_battle",
            BTN_POKEMON: "btn_pokemon",
            BTN_ITEM: "btn_item",
            BTN_ESCAPE: "btn_escape",
    },
    STATES: {
        BATTLE_MENU: 1,
        SKILL_MENU: 2,
        PENDING: 10,
    },
    ACTION_INTERVAL: 0.5,
    ctor: function (segue) {
        this._super(segue);
    },
    viewDidLoad: function () {
        this._loadTextures();
        this._addObservers();
        this._renderView();
    },
    viewDidUnload: function () {
        this._removeObservers();
        this._unloadTextures();
    },
    didReceiveMemoryWarning: function () {
    },
    _loadTextures: function () {
        for (var plist in this.TEXTURES_TO_LOAD) {
            var tex = this.TEXTURES_TO_LOAD[plist];
            TextureManager.loadTexture(plist, tex);
        }
    },
    _unloadTextures: function () {
        for (var plist in this.TEXTURES_TO_LOAD) {
            TextureManager.unloadTexture(plist);
        }
    },
    _addObservers: function () {
    },
    _removeObservers: function () {
    },
    _renderView: function () {
        // 初始化战斗菜单
        this._battleBoard = ccs.load("json/battle_board.json").node;
        this._battleBoard.setPosition(cc.director.getWinSize().width * 0.8, 80);
        this._battleBoard.setScale(0);
        this.view().addChild(this._battleBoard);

        var bg = this._battleBoard.getChildByName(this.CCS_NAMES.BG);
        var btnBattle = bg.getChildByName(this.CCS_NAMES.BTN_BATTLE);
        btnBattle.addClickEventListener(MakeScriptHandler(this, this._onBtnClicked));
        var btnPokemon = bg.getChildByName(this.CCS_NAMES.BTN_POKEMON);
        btnPokemon.addClickEventListener(MakeScriptHandler(this, this._onBtnClicked));
        var btnItem = bg.getChildByName(this.CCS_NAMES.BTN_ITEM);
        btnItem.addClickEventListener(MakeScriptHandler(this, this._onBtnClicked));
        var btnEscape = bg.getChildByName(this.CCS_NAMES.BTN_ESCAPE);
        btnEscape.addClickEventListener(MakeScriptHandler(this, this._onBtnClicked));
        // 记录board的bound 用来做取消操作
        this._boardBound = bg.getBoundingBox();
        var worldPos = bg.convertToWorldSpace(cc.p(0, 0));
        this._boardBound.x = worldPos.x;
        this._boardBound.y = worldPos.y;

        // 初始化技能菜单
        var battleProcessor = this.scene().getBattleProcessor();
        var pokemon = battleProcessor.getFriendPokemon();
        this._skillBoard = new BattleSkillBoardView(pokemon);
        this._skillBoard.setPosition(this._battleBoard.getPosition());
        this._skillBoard.setScale(0);
        this.view().addChild(this._skillBoard);

        this.segue().setDelegate(this);

        this._showBattleBoard();
    },
    _showBattleBoard: function () {
        this._state = this.STATES.PENDING;
        this._battleBoard.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.ScaleTo(this.ACTION_INTERVAL, 1),
                new cc.RotateBy(this.ACTION_INTERVAL, 360)
            ),
            new cc.CallFunc(function () {
                this._state = this.STATES.BATTLE_MENU;
            }.bind(this))
        ));
    },
    _hideBattleBoard: function (callback) {
        this._state = this.STATES.PENDING;
        var action = null;
        if (callback instanceof Function) {
            action = new cc.Sequence(
                new cc.Spawn(
                    new cc.ScaleTo(this.ACTION_INTERVAL, 0),
                    new cc.RotateBy(this.ACTION_INTERVAL, -360)
                ),
                new cc.CallFunc(callback)
            );
        } else {
            action = new cc.Spawn(
                new cc.ScaleTo(this.ACTION_INTERVAL, 0),
                new cc.RotateBy(this.ACTION_INTERVAL, -360)
            );
        }
        this._battleBoard.runAction(action);
    },
    _showSkillBoard: function () {
        this._state = this.STATES.PENDING;
        this._skillBoard.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.ScaleTo(this.ACTION_INTERVAL, 1),
                new cc.RotateBy(this.ACTION_INTERVAL, 360)
            ),
            new cc.CallFunc(function () {
                this._state = this.STATES.SKILL_MENU;
            }.bind(this))
        ));
    },
    _hideSkillBoard: function (callback) {
        this._state = this.STATES.PENDING;
        var action = null;
        if (callback instanceof Function) {
            action = new cc.Sequence(
                new cc.Spawn(
                    new cc.ScaleTo(this.ACTION_INTERVAL, 0),
                    new cc.RotateBy(this.ACTION_INTERVAL, -360)
                ),
                new cc.CallFunc(callback)
            );
        } else {
            action = new cc.Spawn(
                new cc.ScaleTo(this.ACTION_INTERVAL, 0),
                new cc.RotateBy(this.ACTION_INTERVAL, -360)
            );
        }
        this._skillBoard.runAction(action);
    },
    _onBtnClicked: function (sender) {
        var btnName = sender.getName();
        if (btnName == this.CCS_NAMES.BTN_BATTLE) {
            // 战斗
            this._hideBattleBoard(MakeScriptHandler(this, this._showSkillBoard));
        } else if (btnName == this.CCS_NAMES.BTN_POKEMON) {
            // 更换精灵
        } else if (btnName == this.CCS_NAMES.BTN_ITEM) {
            // 使用道具
        } else if (btnName == this.CCS_NAMES.BTN_ESCAPE) {
            // 逃跑
        }
    },
    onTouchEnded: function (touch, event) {
        // 触屏到board外的区域 需要做取消操作(如果可以)
        var loc = touch.getLocation();
        if (this._state == this.STATES.SKILL_MENU && !cc.rectContainsPoint(this._boardBound, loc)) {
            this._hideSkillBoard(MakeScriptHandler(this, this._showBattleBoard));
        }
    },
    _battleBoard: null,
    _skillBoard: null,
    _state: null,
    _boardBound: null,
});