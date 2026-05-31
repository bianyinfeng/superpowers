"""Tests for the TokenAccountant module."""

from token_accountant.accountant import TokenAccountant, RewardRate


def test_calculate_reward_default():
    accountant = TokenAccountant()
    # gpt-4o-mini rate: 0.0003 per 1K tokens
    reward = accountant.calculate_reward("gpt-4o-mini", 10000)
    assert abs(reward - 0.003) < 1e-9


def test_calculate_reward_custom_rate():
    rates = [RewardRate(model="custom-model", rate_per_1k_tokens=0.01)]
    accountant = TokenAccountant(reward_rates=rates)
    reward = accountant.calculate_reward("custom-model", 5000)
    assert abs(reward - 0.05) < 1e-9


def test_get_rate_fallback():
    accountant = TokenAccountant()
    # Unknown model should fall back to default rate
    rate = accountant.get_rate("unknown-model-xyz")
    assert rate == 0.001


def test_calculate_reward_zero_tokens():
    accountant = TokenAccountant()
    reward = accountant.calculate_reward("gpt-4o", 0)
    assert reward == 0.0
