<?php

namespace App\Http\Controllers;

use App\Models\SnsAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SnsAccountController extends Controller
{
    /**
     * Get all SNS accounts
     */
    public function index()
    {
        $accounts = SnsAccount::orderBy('platform')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    }

    /**
     * Get a single SNS account
     */
    public function show($id)
    {
        $account = SnsAccount::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'SNS account not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $account
        ]);
    }

    /**
     * Create a new SNS account
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|in:twitter,facebook,instagram',
            'account_name' => 'required|string|max:255',
            'account_id' => 'nullable|string',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'token_expires_at' => 'nullable|date',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $account = SnsAccount::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'SNS account created successfully',
            'data' => $account
        ], 201);
    }

    /**
     * Update an SNS account
     */
    public function update(Request $request, $id)
    {
        $account = SnsAccount::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'SNS account not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'platform' => 'sometimes|in:twitter,facebook,instagram',
            'account_name' => 'sometimes|string|max:255',
            'account_id' => 'nullable|string',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'token_expires_at' => 'nullable|date',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $account->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'SNS account updated successfully',
            'data' => $account
        ]);
    }

    /**
     * Delete an SNS account
     */
    public function destroy($id)
    {
        $account = SnsAccount::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'SNS account not found'
            ], 404);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'SNS account deleted successfully'
        ]);
    }

    /**
     * Toggle account active status
     */
    public function toggleActive($id)
    {
        $account = SnsAccount::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'SNS account not found'
            ], 404);
        }

        $account->is_active = !$account->is_active;
        $account->save();

        return response()->json([
            'success' => true,
            'message' => 'Account status updated',
            'data' => $account
        ]);
    }
}
