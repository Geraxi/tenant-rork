import { protectedProcedure } from '@/backend/trpc/create-context';
import { mockContracts } from '../create/route';

// Add some demo contracts for testing
if (mockContracts.length === 0) {
  mockContracts.push(
    {
      id: 'contract_demo_1',
      property_id: 'prop_1',
      owner_id: 'owner_demo',
      tenant_ids: ['tenant_demo_1'],
      title: 'Contratto di Locazione - Via Roma 123',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      monthly_rent: 800,
      deposit: 1600,
      clauses: 'Clausole standard di locazione...',
      status: 'pending_signatures',
      signatures: [
        {
          id: 'sig_demo_1',
          contract_id: 'contract_demo_1',
          user_id: 'owner_demo',
          signature_image: '',
          signed_at: '',
          status: 'pending',
        },
        {
          id: 'sig_demo_2',
          contract_id: 'contract_demo_1',
          user_id: 'tenant_demo_1',
          signature_image: '',
          signed_at: '',
          status: 'pending',
        },
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'contract_demo_2',
      property_id: 'prop_2',
      owner_id: 'owner_demo_2',
      tenant_ids: ['tenant_demo_1'],
      title: 'Contratto di Locazione - Via Milano 45',
      start_date: '2023-06-01',
      end_date: '2024-05-31',
      monthly_rent: 950,
      deposit: 1900,
      clauses: 'Clausole standard di locazione...',
      status: 'finalized',
      signatures: [
        {
          id: 'sig_demo_3',
          contract_id: 'contract_demo_2',
          user_id: 'owner_demo_2',
          signature_image: 'data:image/png;base64,demo_signature',
          signed_at: '2023-05-25T14:30:00Z',
          status: 'signed',
        },
        {
          id: 'sig_demo_4',
          contract_id: 'contract_demo_2',
          user_id: 'tenant_demo_1',
          signature_image: 'data:image/png;base64,demo_signature',
          signed_at: '2023-06-01T09:00:00Z',
          status: 'signed',
        },
      ],
      pdf_url: 'https://example.com/contract.pdf',
      created_at: '2023-05-20T14:30:00Z',
      updated_at: '2023-06-01T09:00:00Z',
    }
  );
}

export const listContractsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    // Filter contracts where user is either owner or tenant
    const userContracts = mockContracts.filter(contract => 
      contract.owner_id === ctx.userId || 
      contract.tenant_ids.includes(ctx.userId)
    );
    
    console.log(`Found ${userContracts.length} contracts for user ${ctx.userId}`);
    
    return {
      success: true,
      contracts: userContracts,
    };
  });