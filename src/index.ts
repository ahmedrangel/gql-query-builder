import adapters from "./adapters";
import DefaultMutationAdapter from "./adapters/DefaultMutationAdapter";
import DefaultQueryAdapter from "./adapters/DefaultQueryAdapter";
import DefaultSubscriptionAdapter from "./adapters/DefaultSubscriptionAdapter";
import type { IMutationAdapter, IQueryAdapter, IQueryBuilderOptions, ISubscriptionAdapter } from "./types";

export const { DefaultAppSyncQueryAdapter, DefaultAppSyncMutationAdapter } = adapters;
export const gqlQuery = (
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: any,
  config?: any
) => {
  let defaultAdapter: IQueryAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      const customAdapter: IQueryAdapter = new adapter(options, config);
      return customAdapter.queriesBuilder(options);
    }
    defaultAdapter = new DefaultQueryAdapter(options, config);
    return defaultAdapter.queriesBuilder(options);
  }
  if (adapter) {
    const customAdapter: IQueryAdapter = new adapter(options, config);
    return customAdapter.queryBuilder();
  }
  defaultAdapter = new DefaultQueryAdapter(options, config);
  return defaultAdapter.queryBuilder();
};

export const gqlMutation = (
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: IMutationAdapter,
  config?: any
) => {
  let customAdapter: IMutationAdapter;
  let defaultAdapter: IMutationAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      // @ts-ignore
      customAdapter = new adapter(options, config);
      return customAdapter.mutationsBuilder(options);
    }
    defaultAdapter = new DefaultMutationAdapter(options, config);
    return defaultAdapter.mutationsBuilder(options);
  }
  if (adapter) {
    // @ts-ignore
    customAdapter = new adapter(options, config);
    return customAdapter.mutationBuilder();
  }
  defaultAdapter = new DefaultMutationAdapter(options, config);
  return defaultAdapter.mutationBuilder();
};

export const gqlSubscription = (
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: ISubscriptionAdapter
) => {
  let customAdapter: ISubscriptionAdapter;
  let defaultAdapter: ISubscriptionAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      // @ts-ignore
      customAdapter = new adapter(options);
      return customAdapter.subscriptionsBuilder(options);
    }
    defaultAdapter = new DefaultSubscriptionAdapter(options);
    return defaultAdapter.subscriptionsBuilder(options);
  }
  if (adapter) {
    // @ts-ignore
    customAdapter = new adapter(options);
    return customAdapter.subscriptionBuilder();
  }
  defaultAdapter = new DefaultSubscriptionAdapter(options);
  return defaultAdapter.subscriptionBuilder();
};