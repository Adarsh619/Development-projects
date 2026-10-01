import { it, expect } from 'vitest';
import { accountActionLabels } from '../src/AccountMenu';
it('offers auth entry and honest demo exit without a real session',()=>{
 expect(accountActionLabels('',false)).toEqual(['Sign in','Create account','Exit demo']);
 expect(accountActionLabels('',true)).toEqual(['Sign in','Create account']);
});
it('offers settings and actual sign-out only for a supplied authenticated identity',()=>{
 expect(accountActionLabels('fixture@example.com',true)).toEqual(['Account settings','Sign out']);
 expect(accountActionLabels('fixture@example.com',false)).toEqual(['Account settings','Sign out','Exit demo']);
});
