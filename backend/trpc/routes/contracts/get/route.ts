import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { mockContracts } from '../create/route';

const getContractSchema = z.object({
  contract_id: z.string(),
});

export const getContractProcedure = protectedProcedure
  .input(getContractSchema)
  .query(async ({ input, ctx }) => {
    const contract = mockContracts.find(c => c.id === input.contract_id);
    
    if (!contract) {
      throw new Error('Contract not found');
    }
    
    // Check if user has access to this contract
    const hasAccess = contract.owner_id === ctx.userId || 
                     contract.tenant_ids.includes(ctx.userId);
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    
    console.log(`Contract ${contract.id} accessed by user ${ctx.userId}`);
    
    return {
      success: true,
      contract,
    };
  });