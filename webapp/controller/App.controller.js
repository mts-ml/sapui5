sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("todo.controller.App", {
      onInit: function () {
        this.oModel = this.getOwnerComponent().getModel("todo");
        this.oUi = this.getOwnerComponent().getModel("ui");
       
        this._applyListFilters();
      },

      _saveLocal: function () {
        try {
          localStorage.setItem(
            "todo.tasks",
            JSON.stringify(this.oModel.getProperty("/tasks"))
          );
        } catch (e) {
          console.error(e);
        }

        // Recalcula KPIs via componente
        this.getOwnerComponent()._recalcKPIs();
        this._applyListFilters();
      },

      _applyListFilters: function () {
        const oOpenList = this.byId("openList");
        const oDoneList = this.byId("doneList");
        const oDoneDialogList = this.byId("doneDialogList");

        if (oOpenList) {
          const oBindingOpen = oOpenList.getBinding("items");
          if (oBindingOpen) {
            oBindingOpen.filter([
              new Filter({
                path: "done",
                operator: FilterOperator.EQ,
                value1: false,
              }),
            ]);
          }
        }

        [oDoneList, oDoneDialogList].forEach((oList) => {
          if (!oList) return;
          const oBindingDone = oList.getBinding("items");
          if (oBindingDone) {
            oBindingDone.filter([
              new Filter({
                path: "done",
                operator: FilterOperator.EQ,
                value1: true,
              }),
            ]);
          }
        });
      },

      // Adicionando tarefas
      onAddTask: function () {
        const rb = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        const sDesc = this.byId("desc").getValue().trim();

        if (!sDesc) {
          MessageToast.show(rb.getText("TOAST_DESC_REQUIRED"));
          return;
        }

        if (sDesc.length > 200) {
          MessageToast.show(rb.getText("TOAST_MAX_200"));
          return;
        }

        const oPriority = this.byId("priority");
        const sPri = oPriority.getSelectedKey();

        if (!sPri || sPri === "__placeholder") {
          oPriority.setValueState("Error");
          oPriority.setValueStateText(rb.getText("TOAST_SELECT_SEVERITY"));
          MessageToast.show(rb.getText("TOAST_SELECT_SEVERITY"));
          return;
        }

        const oDate = this.byId("dueDate").getDateValue();
        if (!oDate) {
          MessageToast.show(rb.getText("TOAST_DUE_REQUIRED"));
          return;
        }

        // Validação para datas a partir de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (oDate < today) {
          MessageToast.show(rb.getText("TOAST_INVALID_DATE"));
          return;
        }

        const d = new Date(
          oDate.getFullYear(),
          oDate.getMonth(),
          oDate.getDate()
        );
        const tasks = this.oModel.getProperty("/tasks") || [];

        const newTask = {
          id: Date.now(),
          description: sDesc,
          priority: sPri,
          priorityText: this._mapPriorityText(sPri),
          due: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`,
          dueFormatted: `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
          ).padStart(2, "0")}/${d.getFullYear()}`,
          done: false,
        };

        tasks.unshift(newTask);
        this.oModel.setProperty("/tasks", tasks);
        this._saveLocal();

        MessageToast.show(rb.getText("TOAST_CREATED"));

        // Limpa formulário
        this.byId("desc").setValue("");
        this.byId("dueDate").setDateValue(null);
        oPriority.setSelectedKey("__placeholder");
        oPriority.setValueState("None");
      },

      _mapPriorityText: function (k) {
        const rb = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        switch (k) {
          case "L":
            return rb.getText("PRIORITY_TEXT_LOW");
          case "M":
            return rb.getText("PRIORITY_TEXT_MEDIUM");
          case "H":
            return rb.getText("PRIORITY_TEXT_HIGH");
          case "C":
            return rb.getText("PRIORITY_TEXT_CRITICAL");
          default:
            return rb.getText("PRIORITY_TEXT_MEDIUM");
        }
      },

      onDeleteTask: function (oEvt) {
        const oItem = oEvt.getSource().getParent().getParent();
        const sPath = oItem.getBindingContext("todo").getPath();
        const i = parseInt(sPath.split("/").pop(), 10);
        const tasks = this.oModel.getProperty("/tasks");
        const rb = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();

        MessageBox.confirm(rb.getText("MSGBOX_CONFIRM_DELETE"), {
          title: rb.getText("MSGBOX_CONFIRM_DELETE_TITLE"),
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              tasks.splice(i, 1);
              this.oModel.setProperty("/tasks", tasks);
              this._saveLocal();
              MessageToast.show(rb.getText("TOAST_DELETED"));
            }
          },
        });
      },

      onToggleDone: function (oEvt) {
        const oItem = oEvt.getSource().getParent().getParent();
        const oCtx = oItem.getBindingContext("todo");
        const idx = parseInt(oCtx.getPath().split("/").pop(), 10);
        const tasks = this.oModel.getProperty("/tasks");

        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");

        const toggled = !tasks[idx].done;
        tasks[idx].done = toggled;

        if (toggled) {
          tasks[idx].completed = `${y}-${m}-${d}`;
          tasks[idx].completedFormatted = `${d}/${m}/${y}`;
        } else {
          delete tasks[idx].completed;
          delete tasks[idx].completedFormatted;
        }

        this.oModel.setProperty("/tasks", tasks);
        this._saveLocal();

        const rb = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        MessageToast.show(
          toggled ? rb.getText("TOAST_RESOLVED") : rb.getText("TOAST_REOPENED")
        );
      },

      onAddByEnter: function () {
        this.onAddTask();
      },

      onPriorityChange: function () {
        const rb = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        const oPriority = this.byId("priority");
        const sKey = oPriority.getSelectedKey();

        if (!sKey || sKey === "__placeholder") {
          oPriority.setValueState("Error");
          oPriority.setValueStateText(rb.getText("TOAST_SELECT_SEVERITY"));
        } else {
          oPriority.setValueState("None");
        }
      },

      onOpenDoneDialog: function () {
        const oDlg = this.byId("doneDialog");
        if (oDlg) {
          this._applyListFilters();
          oDlg.open();
        }
      },

      onCloseDoneDialog: function () {
        const oDlg = this.byId("doneDialog");
        if (oDlg) {
          oDlg.close();
        }
      },
    });
  }
);
