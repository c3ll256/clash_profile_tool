export default {
  namespace: 'global',
  state: {
    originProxyProfile: "",
    originRuleProfile: "",
    parsedProxyProfile: Object(),
    parsedRuleProfile: Object(),
    gruopProxiesConfig: [],
    groupOptions: [],
    editDisable: true,
  },
  reducers: {
    setOriginProxyProfile(state, action) {
      return {
        ...state,
        originProxyProfile: action.payload,
      };
    },
    setOriginRuleProfile(state, action) {
      return {
        ...state,
        originRuleProfile: action.payload,
      };
    },
    setParsedProxyProfile(state, action) {
      return {
        ...state,
        parsedProxyProfile: action.payload,
      };
    },
    setParsedRuleProfile(state, action) {
      return {
        ...state,
        parsedRuleProfile: action.payload,
      };
    },
    setGroupOptions(state, action) {
      return {
        ...state,
        groupOptions: action.payload,
      };
    },
    setTransferData(state, action) {
      return {
        ...state,
        gruopProxiesConfig: action.gruopProxiesConfig,
      }
    },
    setEditDisable(state, action) {
      return {
        ...state,
        editDisable: action.editDisable,
      }
    }
  }
};
