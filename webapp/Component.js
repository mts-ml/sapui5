sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (UIComponent, JSONModel, ResourceModel) {
    "use strict";

    return UIComponent.extend("todo.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        // Modelo de tarefas
        const oData = {
          tasks: [],
        };

        // Carrega do localStorage se existir
        try {
          const tasksOnLocalStorage = localStorage.getItem("todo.tasks");
          if (tasksOnLocalStorage) {
            oData.tasks = JSON.parse(tasksOnLocalStorage);
          }
        } catch (e) {
          console.error(e);
        }

        const oModel = new JSONModel(oData);
        this.setModel(oModel, "todo");

        // Modelo para UI (status, contadores)
        const oUi = new JSONModel({
          today: this._formatDate(new Date()),
          kpis: { overdue: 0, today: 0, tomorrow: 0, done: 0 },
        });
        this.setModel(oUi, "ui");

        // Modelo de i18n para textos da interface
        const oI18n = new ResourceModel({
          bundleUrl: "i18n/i18n.properties",
        });
        this.setModel(oI18n, "i18n");

        const oRouter = this.getRouter && this.getRouter();
        if (oRouter) {
          oRouter.initialize && oRouter.initialize();
        }

        // recalcula KPIs
        this._recalcKPIs();
      },

      _formatDate: function (d) {
        // retorna YYYY-MM-DD para comparação
        return (
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0")
        );
      },

      _recalcKPIs: function () {
        const oModel = this.getModel("todo");
        const a = oModel.getProperty("/tasks") || [];
        const today = new Date();
        const t0 = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const t1 = new Date(t0);
        t1.setDate(t0.getDate() + 1);

        let overdue = 0,
          td = 0,
          tm = 0;
        let doneCount = 0;

        a.forEach(function (task) {
          if (task.done) {
            doneCount++;
            return; // concluídas não contam
          }

          // contabiliza como urgente se estiver atrasado OU se for crítico
          const isCritical = task.priority === "C";
          if (task.due) {
            const parts = task.due.split("-"); // YYYY-MM-DD
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            if (d < t0) {
              overdue++;
            } else if (d.getTime() === t0.getTime()) {
              td++;
            } else if (d.getTime() === t1.getTime()) {
              tm++;
            }
          }

          if (isCritical) {
            overdue++;
          }
        });

        const oUi = this.getModel("ui");
        oUi.setProperty("/kpis/overdue", overdue);
        oUi.setProperty("/kpis/today", td);
        oUi.setProperty("/kpis/tomorrow", tm);
        oUi.setProperty("/kpis/done", doneCount);
      },
    });
  }
);
