let wpRequire;
window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  (e) => {
    wpRequire = e;
  },
]),
  (mod = Object.values(wpRequire.c).find(
    (e) => void 0 !== e?.exports?.Z?.isDeveloper
  )),
  (usermod = Object.values(wpRequire.c).find(
    (e) => e?.exports?.default?.getUsers
  )),
  (nodes = Object.values(
    mod.exports.Z._dispatcher._actionHandlers._dependencyGraph.nodes
  ));
try {
  nodes
    .find((e) => "ExperimentStore" == e.name)
    .actionHandler.OVERLAY_INITIALIZE({ user: { flags: 1 } });
} catch (e) {}
(oldGetUser = usermod.exports.default.__proto__.getCurrentUser),
  (usermod.exports.default.__proto__.getCurrentUser = () => ({
    hasFlag: () => !0,
  })),
  nodes
    .find((e) => "DeveloperExperimentStore" == e.name)
    .actionHandler.CONNECTION_OPEN(),
  (usermod.exports.default.__proto__.getCurrentUser = oldGetUser);