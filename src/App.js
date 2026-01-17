import logo from "./logo.svg";
import "./App.css";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import React, { useEffect, useState } from "react";

function App() {
  React.useEffect(() => {
    async function fetchData() {
      const url = window.location.href;
      const ifcGuid = url.split("?")[1];
      if (!ifcGuid) {
        return;
      }
      if (ifcGuid.length !== 22) {
        return;
      }
      const tcapi = await WorkspaceAPI.connect(window.parent);
      var models;
      do {
        models = await tcapi.viewer.getModels();
      } while (models === undefined || models.length === 0);
      console.log(models);
      var asm;
      var modelId;
      for (const model of models) {
        const loadedModel = await tcapi.viewer.getLoadedModel(model.id);
        if (loadedModel === undefined) {
          await tcapi.viewer.toggleModel(model.id, true);
        }

        var modelObjects;
        do {
          modelObjects = await tcapi.viewer.getObjects();
        } while (modelObjects === undefined || modelObjects.length === 0);
        console.log(modelObjects);
        const runtimeIds = await tcapi.viewer.convertToObjectRuntimeIds(
          model.id,
          [ifcGuid]
        );
        console.log(runtimeIds);
        if (
          runtimeIds !== undefined &&
          runtimeIds.length > 0 &&
          runtimeIds[0] >= 0
        ) {
          asm = runtimeIds[0];
          modelId = model.id;
          break;
        } else {
          await tcapi.viewer.toggleModel(model.id, false);
        }
      }
      console.log(asm);
      console.log(modelId);
      tcapi.viewer.setCamera({
        modelObjectIds: [
          {
            modelId: modelId,
            objectRuntimeIds: [asm],
          },
        ],
      });
      tcapi.viewer.setSelection({
        modelObjectIds: [
          {
            modelId: modelId,
            objectRuntimeIds: [asm],
          },
        ],
      });
      tcapi.viewer.isolateEntities([
        {
          modelId: modelId,
          entityIds: [asm],
        },
      ]);
      tcapi.viewer.setCamera({
        modelObjectIds: [
          {
            modelId: modelId,
            objectRuntimeIds: [asm],
          },
        ],
      });
    }
    fetchData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <p>Assembly has been loaded IBIM!</p>
      </header>
    </div>
  );
}

export default App;
