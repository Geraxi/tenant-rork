import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { RentalContract, ContractSignature } from '@/types';

// Mock storage for contracts
const mockContracts: RentalContract[] = [];

const createContractSchema = z.object({
  property_id: z.string().optional(),
  tenant_ids: z.array(z.string()).optional(),
  title: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  monthly_rent: z.number(),
  deposit: z.number(),
  clauses: z.string(),
  notes: z.string().optional(),
  template_url: z.string().optional(),
});

export const createContractProcedure = protectedProcedure
  .input(createContractSchema)
  .mutation(async ({ input, ctx }) => {
    const contractId = `contract_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();
    
    // Default tenant IDs if not provided (for demo purposes)
    const tenantIds = input.tenant_ids || ['tenant_demo_1'];
    
    // Create signatures for owner and all tenants
    const signatures: ContractSignature[] = [
      {
        id: `sig_${Math.random().toString(36).substring(2, 11)}`,
        contract_id: contractId,
        user_id: ctx.userId,
        signature_image: '',
        signed_at: '',
        status: 'pending' as const,
      },
      ...tenantIds.map(tenantId => ({
        id: `sig_${Math.random().toString(36).substring(2, 11)}`,
        contract_id: contractId,
        user_id: tenantId,
        signature_image: '',
        signed_at: '',
        status: 'pending' as const,
      }))
    ];
    
    const contract: RentalContract = {
      id: contractId,
      property_id: input.property_id || 'demo_property',
      owner_id: ctx.userId,
      tenant_ids: tenantIds,
      title: input.title,
      start_date: input.start_date,
      end_date: input.end_date,
      monthly_rent: input.monthly_rent,
      deposit: input.deposit,
      clauses: input.clauses,
      notes: input.notes,
      template_url: input.template_url,
      status: 'pending_signatures',
      signatures,
      created_at: now,
      updated_at: now,
    };
    
    // Store in mock database
    mockContracts.push(contract);
    console.log('Contract created:', contract.id);
    
    // Send notifications to tenants (mock)
    tenantIds.forEach(tenantId => {
      console.log(`Notification sent to tenant ${tenantId}: New contract requires signature`);
    });
    
    return {
      success: true,
      contract,
    };
  });

// Export mock storage for other routes to access
export { mockContracts };