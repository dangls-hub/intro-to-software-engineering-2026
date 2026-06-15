package com.bluemoon.ams.module.fee.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.fee.mapper.FeeMapper;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeeServiceTest {

    @Mock
    private FeeRepository feeRepository;

    @Mock
    private FeeMapper feeMapper;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentRequestRepository paymentRequestRepository;

    @InjectMocks
    private FeeService feeService;

    private Long feeId;

    @BeforeEach
    public void setUp() {
        feeId = 1L;
    }

    @Test
    public void deleteFee_NotFound_ThrowsResourceNotFoundException() {
        when(feeRepository.existsById(feeId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> feeService.deleteFee(feeId));

        verify(feeRepository, times(1)).existsById(feeId);
        verify(paymentRepository, never()).existsByFeeId(anyLong());
        verify(paymentRequestRepository, never()).deleteByFeeId(anyLong());
        verify(feeRepository, never()).deleteById(anyLong());
    }

    @Test
    public void deleteFee_HasPayments_ThrowsIllegalArgumentException() {
        when(feeRepository.existsById(feeId)).thenReturn(true);
        when(paymentRepository.existsByFeeId(feeId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> feeService.deleteFee(feeId));

        verify(feeRepository, times(1)).existsById(feeId);
        verify(paymentRepository, times(1)).existsByFeeId(feeId);
        verify(paymentRequestRepository, never()).deleteByFeeId(anyLong());
        verify(feeRepository, never()).deleteById(anyLong());
    }

    @Test
    public void deleteFee_NoPayments_DeletesRequestsAndFee() {
        when(feeRepository.existsById(feeId)).thenReturn(true);
        when(paymentRepository.existsByFeeId(feeId)).thenReturn(false);

        feeService.deleteFee(feeId);

        verify(feeRepository, times(1)).existsById(feeId);
        verify(paymentRepository, times(1)).existsByFeeId(feeId);
        verify(paymentRequestRepository, times(1)).deleteByFeeId(feeId);
        verify(feeRepository, times(1)).deleteById(feeId);
    }
}
