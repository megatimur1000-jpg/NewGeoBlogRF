declare module 'lodash/compact' {
  function compact<T>(array: Array<T | null | undefined | false | '' | 0>): T[];
  export default compact;
}
